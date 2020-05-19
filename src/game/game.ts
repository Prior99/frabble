import { create as randomSeed } from "random-seed";
import { addSeconds, differenceInSeconds, isAfter } from "date-fns";
import { computed, action, observable } from "mobx";
import { Peer, Host, Client } from "../networking";
import {
    NetworkingMode,
    GameState,
    Language,
    RemoteUser,
    Letter,
    CellPosition,
    CellPositionType,
    CellPositionStand,
} from "../types";
import { RemoteUsers } from "./remote-users";
import { component } from "tsdi";
import { GameConfig } from "../types";
import { v4 } from "uuid";
import { Board, ValidityResult } from "../game-logic";
import { LetterBag } from "../game-logic/letter-bag";
import { prop } from "ramda";
import { shuffle, invariant, cellPositionEquals } from "../utils";
import { Stand } from "../game-logic/stand";

export interface Score {
    rank: number;
    score: number;
    playerName: string;
    playerId: string;
}

@component
export class Game {
    public users = new RemoteUsers();
    @observable public config: GameConfig = {
        language: Language.GERMAN,
        seed: v4(),
    };
    @observable public state = GameState.LOBBY;
    @observable.shallow public peer: Peer | undefined;
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

    @computed public get scoreList(): Score[] {
        return Array.from(this.scores.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([playerId, score]) => ({ playerId, playerName: this.users.getUser(playerId)?.name ?? "", score }))
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

    @computed public get networkMode(): NetworkingMode {
        if (!this.peer) {
            return NetworkingMode.DISCONNECTED;
        }
        if (this.peer instanceof Host) {
            return NetworkingMode.HOST;
        }
        return NetworkingMode.CLIENT;
    }

    @computed public get currentUserId(): string {
        return this.turnOrder[this.turn % this.turnOrder.length];
    }

    @computed public get currentUser(): RemoteUser {
        const user = this.users.getUser(this.currentUserId);
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
        if (!(this.peer instanceof Host)) {
            throw new Error("Client can't start game.");
        }
        this.peer.sendGameStart(this.config);
    }

    @action.bound public moveCell(sourcePosition: CellPosition, targetPosition: CellPosition): void {
        this.peer?.sendCellMove({ sourcePosition, targetPosition });
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

    @action.bound public confirmPassing(): void {
        if (this.lettersToExchange === undefined) {
            throw new Error("Must start passing before committing.");
        }

        this.peer?.sendPass(this.lettersToExchange);
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
        if (this.currentUserId !== this.users.ownUser.id) {
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

    @action.bound public endTurn(): void {
        this.peer?.sendEndTurn();
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
        if (this.turn < this.users.count * 2 - 1) {
            return false;
        }
        for (let i = 0; i < this.users.count * 2; ++i) {
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
        for (const user of this.users.all) {
            this.scores.set(
                user.id,
                (this.scores.get(user.id) ?? 0) - (this.stands.get(user.id)?.missingLetterCount ?? 0),
            );
        }
    }

    @action.bound public restart(): void {
        if (!(this.peer instanceof Host)) {
            return;
        }
        this.peer.sendRestart();
    }

    @action.bound public async initialize(networkId?: string): Promise<void> {
        setInterval(
            action(() => {
                if (this.isGameOver) {
                    return;
                }
                if (!this.times || this.times.fromTurn !== this.turn) {
                    return;
                }
                if (isAfter(this.times.now!, this.times.deadline!)) {
                    if (this.currentUserId === this.users.ownUser.id) {
                        this.times = undefined;
                        this.startPassing();
                        this.confirmPassing();
                    }
                } else {
                    this.times.now = new Date();
                }
            }),
            500,
        );

        const Ctor = typeof networkId === "string" ? Client : Host;
        this.peer = new Ctor(this.users);

        this.peer.onRestart(
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
            }),
        );
        this.peer.onWelcome(
            action((users) => {
                this.users.add(...users);
            }),
        );
        this.peer.onUserConnected(
            action((user) => {
                this.users.add(user);
            }),
        );
        this.peer.onUserDisconnected(
            action((userId) => {
                this.users.remove(userId);
            }),
        );
        this.peer.onGameStart(
            action((config) => {
                this.state = GameState.STARTED;
                this.config = config;
                this.board.initialize();
                const rng = randomSeed(config.seed);
                this.letterBag.initialize(config.seed);
                this.turnOrder = shuffle(this.users.all.map(prop("id")).sort(), () => rng.floatBetween(0, 1));
                this.turnOrder.forEach((id) => {
                    this.scores.set(id, 0);
                    const stand = new Stand(this.letterBag.takeMany(Stand.MAX_LETTERS));
                    this.stands.set(id, stand);
                });
                this.turn = 0;
                this.startTurn();
            }),
        );
        this.peer.onCellMove(
            action((sourcePosition: CellPosition, targetPosition: CellPosition) => {
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
        this.peer.onEndTurn(
            action(() => {
                this.awardScore();
                this.abortPassing();
                const newLetters = this.letterBag.takeMany(this.currentStand.missingLetterCount);
                this.currentStand.add(...newLetters);
                this.nextTurn();
            }),
        );
        this.peer.onPass(
            action((exchangedLetterCells: CellPositionStand[]) => {
                exchangedLetterCells.forEach((exchange) => {
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

        if (this.peer instanceof Host) {
            await this.peer.host();
        }
        if (this.peer instanceof Client) {
            await this.peer.connect(networkId as string);
        }
    }
}
