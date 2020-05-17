
import { computed, action, observable } from "mobx";
import { Peer, Host, Client } from "../networking";
import { NetworkingMode, GameState, Language } from "../types";
import { RemoteUsers } from "./remote-users";
import { component } from "tsdi";
import { GameConfig } from "../types";

@component
export class Game {
    public users = new RemoteUsers();
    @observable public config: GameConfig = {
        language: Language.GERMAN,
    };
    @observable public state = GameState.LOBBY;
    @observable.shallow public peer: Peer | undefined;

    @computed public get networkMode() {
        if (!this.peer) {
            return NetworkingMode.DISCONNECTED
        }
        if (this.peer instanceof Host) {
            return NetworkingMode.HOST;
        }
        return NetworkingMode.CLIENT;
    }

    @action.bound public startGame() {
        if (!(this.peer instanceof Host)) {
            throw new Error("Client can't start game.");
        }
        this.peer.sendGameStart(this.config);
    }

    @action.bound public async initialize(networkId?: string): Promise<void> {
        this.peer = typeof networkId === "string" ? new Client() : new Host(this.users);

        this.peer.onWelcome(users => {
            this.users.add(...users);
        });
        this.peer.onUserConnected(user => {
            this.users.add(user);
        });
        this.peer.onUserDisconnected(userId => {
            this.users.remove(userId);
        }) ;
        this.peer.onGameStart(config => {
            this.state = GameState.STARTED;
            this.config = config;
        });

        if (this.peer instanceof Host) {
            await this.peer.host();
        }
        if (this.peer instanceof Client) {
            await this.peer.connect(networkId as string, this.users.ownUser);
        }
    }
}
