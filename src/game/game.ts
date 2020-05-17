import { create as randomSeed, RandomSeed } from "random-seed";
import { computed, action, observable } from "mobx";
import { Peer, Host, Client } from "../networking";
import { NetworkingMode, GameState, Language, RemoteUser, Letter } from "../types";
import { RemoteUsers } from "./remote-users";
import { component } from "tsdi";
import { GameConfig } from "../types";
import { v4 } from "uuid";
import { Board } from "../game-logic";
import { LetterBag } from "../game-logic/letter-bag";
import { prop } from "ramda";
import { shuffle, Vec2 } from "../utils";

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

    @computed public get networkMode() {
        if (!this.peer) {
            return NetworkingMode.DISCONNECTED
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

    @action.bound public startGame() {
        if (!(this.peer instanceof Host)) {
            throw new Error("Client can't start game.");
        }
        this.peer.sendGameStart(this.config);
    }

    @action.bound private awardScore() {
        // TODO: Implement.
    }

    @action.bound public async initialize(networkId?: string): Promise<void> {
        const Ctor = typeof networkId === "string" ? Client : Host;
        this.peer = new Ctor(this.users);

        this.peer.onWelcome(action(users => {
            this.users.add(...users);
        }));
        this.peer.onUserConnected(action(user => {
            this.users.add(user);
        }));
        this.peer.onUserDisconnected(action(userId => {
            this.users.remove(userId);
        }));
        this.peer.onGameStart(action(config => {
            this.state = GameState.STARTED;
            this.config = config;
            this.board.initialize();
            const rng = randomSeed(config.seed);
            this.letterBag.initialize(config.seed);
            this.turnOrder = shuffle(this.users.all.map(prop("id")), () => rng.floatBetween(0, 1));
            this.users.all.map(prop("id")).forEach(id => this.scores.set(id, 0));
            this.turn = 0;
        }));
        this.peer.onLetterPlace(action((pos: Vec2, letter: Letter) => {
            this.board.letterPlace(pos, letter, this.currentUserId, this.turn);
        }));
        this.peer.onLetterRemove(action((pos: Vec2) => {
            this.board.letterRemove(pos);
        }));
        this.peer.onEndTurn(action(() => {
            this.awardScore();
            this.turn++;
        }));
        this.peer.onPass(action((letters: Letter[]) => {
            this.letterBag.exchange(...letters)
        }));

        if (this.peer instanceof Host) {
            await this.peer.host();
        }
        if (this.peer instanceof Client) {
            await this.peer.connect(networkId as string);
        }
    }
}
