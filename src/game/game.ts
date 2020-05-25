import { create as randomSeed } from "random-seed";
import { addSeconds, differenceInSeconds, isAfter } from "date-fns";
import { computed, action, observable } from "mobx";
import {
    GameState,
    Language,
    Letter,
    CellPosition,
    CellPositionType,
    CellPositionStand,
    AppUser,
    MessageType,
    MessageGameStart,
    MessageCellMove,
    MessageRestart,
    MessagePass,
    MessageEndTurn,
} from "../types";
import { component } from "tsdi";
import { GameConfig } from "../types";
import { v4 } from "uuid";
import { Board, ValidityResult } from "../game";
import { LetterBag } from "../game/letter-bag";
import { prop } from "ramda";
import {
    shuffle,
    invariant,
    cellPositionEquals,
    generateUserName,
    serializeCellPosition,
    deserializeCellPosition,
} from "../utils";
import { Stand } from "../game/stand";
import { createClient, createHost, PeerOptions, Peer, NetworkMode, MessageFactory } from "p2p-networking";

export interface Score {
    rank: number;
    score: number;
    playerName: string;
    playerId: string;
}

export const enum LoadingFeatures {
    NEXT_TURN = "next turn",
    PASS = "pass",
    RESTART = "restart",
}

@component
export class Game {
    @observable public users = new Map<string, AppUser>();
    @observable public userId: string | undefined;
    @observable public networkMode = NetworkMode.DISCONNECTED;
    @observable public networkId: string | undefined;
    @observable public config: GameConfig = {
        language: Language.GERMAN,
        seed: v4(),
    };
    @observable public state = GameState.LOBBY;
    public peer: Peer<AppUser, MessageType> | undefined;
    public board = new Board();
    public letterBag = new LetterBag();
    @observable public turnOrder: string[] = [];
    @observable public turn = 0;
    @observable public scores = new Map<string, number>();
    @observable public stands = new Map<string, Stand>();

    @observable public lettersToExchange: CellPositionStand[] | undefined;
    @observable public times:
        | {
              deadline: Date;
              now: Date;
              fromTurn: number;
          }
        | undefined;
    @observable public passedTurns = new Set<number>();
    @observable public loading = new Set<LoadingFeatures>();

    private messageGameStart?: MessageFactory<MessageType, MessageGameStart>;
    private messageRestart?: MessageFactory<MessageType, MessageRestart>;
    private messagePass?: MessageFactory<MessageType, MessagePass>;
    private messageCellMove?: MessageFactory<MessageType, MessageCellMove>;
    private messageEndTurn?: MessageFactory<MessageType, MessageEndTurn>;

    @computed public get scoreList(): Score[] {
        return Array.from(this.scores.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([playerId, score]) => ({ playerId, playerName: this.getUser(playerId)?.name ?? "", score }))
            .map(({ playerName, playerId, score }, index) => ({
                rank: index + 1,
                score,
                playerName,
                playerId,
            }));
    }

    public getRank(playerId: string): number {
        return this.scoreList.find((entry) => entry.playerId === playerId)?.rank ?? 0;
    }

    public getUser(userId: string): AppUser | undefined {
        return this.users.get(userId);
    }

    @computed public get user(): AppUser | undefined {
        if (!this.userId) {
            return;
        }
        return this.users.get(this.userId);
    }

    @computed public get userList(): AppUser[] {
        return Array.from(this.users.values());
    }

    @computed public get currentUserId(): string {
        return this.turnOrder[this.turn % this.turnOrder.length];
    }

    @computed public get currentUser(): AppUser {
        const user = this.users.get(this.currentUserId);
        if (!user) {
            throw new Error(`Inconsistency: User ${this.currentUserId} is unknown.`);
        }
        return user;
    }

    @computed public get currentStand(): Stand {
        const stand = this.stands.get(this.currentUserId);
        if (!stand) {
            throw new Error(`Inconsistency: User ${this.currentUserId} is unknown.`);
        }
        return stand;
    }

    @action.bound public startGame(): void {
        if (this.networkMode !== NetworkMode.HOST) {
            throw new Error("Client can't start game.");
        }
        if (!this.messageGameStart) {
            throw new Error("Network not initialized.");
        }
        this.messageGameStart.send({ config: this.config });
    }

    @action.bound public moveCell(sourcePosition: CellPosition, targetPosition: CellPosition): void {
        if (!this.messageCellMove) {
            throw new Error("Network not initialized.");
        }
        this.messageCellMove.send({
            sourcePosition: serializeCellPosition(sourcePosition),
            targetPosition: serializeCellPosition(targetPosition),
        });
    }

    @action.bound private awardScore(): void {
        this.scores.set(this.currentUserId, (this.scores.get(this.currentUserId) ?? 0) + (this.currentTurnScore ?? 0));
    }

    @computed public get currentTurnScore(): number | undefined {
        let score = this.board.getTurnScore(this.turn);
        if (score === undefined) {
            return;
        }
        if (this.board.getLettersForTurn(this.turn).length === Stand.MAX_LETTERS) {
            score += 50;
        }
        return score;
    }

    @computed public get canPass(): boolean {
        return this.board.getLettersForTurn(this.turn).length === 0;
    }

    @action.bound public startPassing(): void {
        this.lettersToExchange = [];
    }

    @action.bound public async confirmPassing(): Promise<void> {
        if (!this.messagePass) {
            throw new Error("Network not initialized.");
        }
        if (this.lettersToExchange === undefined) {
            throw new Error("Must start passing before committing.");
        }

        this.loading.add(LoadingFeatures.PASS);
        await this.messagePass.send({ exchangedLetters: this.lettersToExchange }).waitForAll();
        this.loading.add(LoadingFeatures.PASS);
        this.lettersToExchange = undefined;
    }

    @action.bound public abortPassing(): void {
        this.lettersToExchange = undefined;
    }

    @action.bound public markLetterForExchange(letterCell: CellPositionStand): void {
        if (this.lettersToExchange === undefined) {
            throw new Error("Must start passing before marking a letter.");
        }

        if (this.lettersToExchange.some((exchange) => cellPositionEquals(exchange, letterCell))) {
            throw new Error("Letter already marked.");
        }

        this.lettersToExchange.push(letterCell);
    }

    @action.bound public unmarkLetterForExchange(letterCell: CellPositionStand): void {
        if (this.lettersToExchange === undefined) {
            throw new Error("Must start passing before unmarking a letter.");
        }

        this.lettersToExchange = this.lettersToExchange.filter((exchange) => !cellPositionEquals(exchange, letterCell));
    }

    @action.bound public returnAllLettersToStand(): void {
        const cells = this.board.getLettersForTurn(this.turn);
        let index = 0;
        cells.forEach((cell) => {
            index = this.currentStand.nextFreePosition(index);
            this.moveCell(
                {
                    positionType: CellPositionType.BOARD,
                    position: cell.position,
                },
                {
                    positionType: CellPositionType.STAND,
                    playerId: this.currentUserId,
                    index,
                },
            );
            index++;
        });
    }

    @computed public get isPassing(): boolean {
        return this.lettersToExchange !== undefined;
    }

    @computed public get currentTurnValid(): ValidityResult {
        return this.board.isTurnValid(this.turn);
    }

    @computed public get canEndTurn(): boolean {
        return this.currentTurnValid.valid;
    }

    @computed public get endTurnMessage(): string {
        if (this.currentUserId !== this.user?.id) {
            return "It's not your turn.";
        }
        const valid = this.currentTurnValid;
        if (valid.valid) {
            return "";
        }
        return valid.reason;
    }

    @computed public get secondsLeft(): number {
        if (!this.times) {
            return 0;
        }
        return differenceInSeconds(this.times.deadline, this.times.now);
    }

    @computed public get progressPercent(): number {
        if (!this.config.timeLimit) {
            return 0;
        }
        return 100 - (this.secondsLeft / this.config.timeLimit) * 100;
    }

    @computed public get showProgress(): boolean {
        return Boolean(this.config.timeLimit);
    }

    public getCellTurn(position: CellPosition): number | undefined {
        switch (position.positionType) {
            case CellPositionType.BOARD: {
                const cell = this.board.at(position.position);
                if (cell.empty) {
                    return;
                }
                return cell.turn;
            }
            case CellPositionType.STAND:
                return;
            default:
                invariant(position);
        }
    }

    public getLetter(position: CellPosition): Letter | undefined {
        switch (position.positionType) {
            case CellPositionType.BOARD: {
                const cell = this.board.at(position.position);
                if (cell.empty) {
                    return;
                }
                return cell.letter;
            }
            case CellPositionType.STAND: {
                const stand = this.stands.get(position.playerId);
                if (!stand) {
                    throw new Error(`Couldn't find stand for player ${position.playerId}.`);
                }
                return stand.at(position.index);
            }
            default:
                invariant(position);
        }
    }

    @action.bound public async endTurn(): Promise<void> {
        if (!this.messageEndTurn) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.NEXT_TURN);
        await this.messageEndTurn.send({}).waitForAll();
        this.loading.delete(LoadingFeatures.NEXT_TURN);
    }

    @action.bound private startTurn(): void {
        if (this.config.timeLimit) {
            const now = new Date();
            const deadline = addSeconds(now, this.config.timeLimit);
            this.times = { now, deadline, fromTurn: this.turn };
        }
    }

    @action.bound private nextTurn(): void {
        this.handleGameOver();
        if (this.isGameOver) {
            return;
        }
        this.turn++;
        this.startTurn();
    }

    @computed public get isGameOver(): boolean {
        const hasEmptyStand = Array.from(this.stands.values()).some((stand) => stand.isEmpty);
        if (this.letterBag.isEmpty && hasEmptyStand && this.board.getLettersForTurn(this.turn).length === 0) {
            return true;
        }
        if (this.turn < this.users.size * 2 - 1) {
            return false;
        }
        for (let i = 0; i < this.users.size * 2; ++i) {
            if (!this.passedTurns.has(this.turn - i)) {
                return false;
            }
        }
        return true;
    }

    @action.bound private handleGameOver(): void {
        if (!this.isGameOver) {
            return;
        }
        for (const user of this.userList) {
            this.scores.set(
                user.id,
                (this.scores.get(user.id) ?? 0) - (this.stands.get(user.id)?.missingLetterCount ?? 0),
            );
        }
    }

    @action.bound public async restart(): Promise<void> {
        if (this.networkMode !== NetworkMode.HOST) {
            return;
        }
        if (!this.messageRestart) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.RESTART);
        await this.messageRestart.send({}).waitForAll();
        this.loading.delete(LoadingFeatures.RESTART);
    }

    @action.bound public async initialize(networkId?: string): Promise<void> {
        this.networkMode = NetworkMode.CONNECTING;
        setInterval(
            action(() => {
                if (this.isGameOver) {
                    return;
                }
                if (!this.times || this.times.fromTurn !== this.turn) {
                    return;
                }
                if (isAfter(this.times.now!, this.times.deadline!)) {
                    if (this.currentUserId === this.user?.id) {
                        this.times = undefined;
                        this.loading.add(LoadingFeatures.PASS);
                        this.returnAllLettersToStand();
                        if (!this.isPassing) {
                            this.startPassing();
                        }
                        this.confirmPassing();
                    }
                } else {
                    this.times.now = new Date();
                }
            }),
            500,
        );

        const options: PeerOptions<AppUser> = {
            applicationProtocolVersion: "0.0.0",
            user: {
                name: generateUserName(),
            },
            peerJsOptions: {
                host: "peerjs.92k.de",
                secure: true,
            },
        };
        this.peer = networkId
            ? await createClient(options, networkId)
            : await createHost({ ...options, pingInterval: 10 });


        for (const user of this.peer.users) {
            this.users.set(user.id, user);
        }

        this.userId = this.peer.userId;
        this.networkId = this.peer.hostConnectionId;
        this.networkMode = this.peer.networkMode;

        this.messageRestart = this.peer.message<MessageRestart>(MessageType.RESTART);
        this.messagePass = this.peer.message<MessagePass>(MessageType.PASS);
        this.messageGameStart = this.peer.message<MessageGameStart>(MessageType.GAME_START);
        this.messageCellMove = this.peer.message<MessageCellMove>(MessageType.CELL_MOVE);
        this.messageEndTurn = this.peer.message<MessageEndTurn>(MessageType.END_TURN);

        this.messageRestart.subscribe(
            action(() => {
                this.board.initialize();
                this.letterBag.refill();
                this.turnOrder.forEach((id) => {
                    this.scores.set(id, 0);
                    const stand = new Stand(this.letterBag.takeMany(Stand.MAX_LETTERS));
                    this.stands.set(id, stand);
                });
                this.turn = 0;
                this.startTurn();
                this.loading.delete(LoadingFeatures.RESTART);
            }),
        );
        this.messageGameStart.subscribe(
            action(({ config }) => {
                this.state = GameState.STARTED;
                this.config = config;
                this.board.initialize();
                const rng = randomSeed(config.seed);
                this.letterBag.initialize(config.seed);
                this.turnOrder = shuffle(this.userList.map(prop("id")).sort(), () => rng.floatBetween(0, 1));
                this.turnOrder.forEach((id) => {
                    this.scores.set(id, 0);
                    const stand = new Stand(this.letterBag.takeMany(Stand.MAX_LETTERS));
                    this.stands.set(id, stand);
                });
                this.turn = 0;
                this.startTurn();
            }),
        );
        this.messageCellMove.subscribe(
            action((movement) => {
                const sourcePosition = deserializeCellPosition(movement.sourcePosition);
                const targetPosition = deserializeCellPosition(movement.targetPosition);
                const letter = this.getLetter(sourcePosition);
                if (!letter) {
                    throw new Error("Cannot move empty cell.");
                }
                switch (sourcePosition.positionType) {
                    case CellPositionType.STAND: {
                        const stand = this.stands.get(sourcePosition.playerId);
                        if (!stand) {
                            throw new Error(`Couldn't find stand for player ${sourcePosition.playerId}.`);
                        }
                        stand.remove(sourcePosition.index);
                        break;
                    }
                    case CellPositionType.BOARD:
                        this.board.letterRemove(sourcePosition.position);
                        break;
                    default:
                        invariant(sourcePosition);
                }
                switch (targetPosition.positionType) {
                    case CellPositionType.STAND: {
                        const stand = this.stands.get(targetPosition.playerId);
                        if (!stand) {
                            throw new Error(`Couldn't find stand for player ${targetPosition.playerId}.`);
                        }
                        stand.set(targetPosition.index, letter);
                        break;
                    }
                    case CellPositionType.BOARD:
                        this.board.letterPlace(targetPosition.position, letter, this.currentUserId, this.turn);
                        break;
                    default:
                        invariant(targetPosition);
                }
            }),
        );
        this.messageEndTurn.subscribe(
            action(() => {
                this.awardScore();
                this.abortPassing();
                const newLetters = this.letterBag.takeMany(this.currentStand.missingLetterCount);
                this.currentStand.add(...newLetters);
                this.nextTurn();
            }),
        );
        this.messagePass.subscribe(
            action(({ exchangedLetters }) => {
                exchangedLetters.forEach((exchange) => {
                    if (exchange.positionType !== CellPositionType.STAND) {
                        throw new Error("Can't exchange letters from board.");
                    }
                    const stand = this.stands.get(exchange.playerId);

                    if (!stand) {
                        throw new Error(`Inconsistency: User ${exchange.playerId} unknown.`);
                    }

                    const removedLetters = stand.remove(exchange.index);
                    const [newLetter] = this.letterBag.exchange(...removedLetters);

                    stand.set(exchange.index, newLetter);
                });
                this.passedTurns.add(this.turn);
                this.nextTurn();
            }),
        );
        this.peer.on(
            "userconnect",
            action((user) => this.users.set(user.id, user)),
        );
        this.peer.on(
            "userdisconnect",
            action((userId) => this.users.delete(userId)),
        );
    }
}
