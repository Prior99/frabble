
import { computed, action, observable } from "mobx";
import { Peer, Host, Client } from "../networking";
import { NetworkingMode } from "../types";
import { RemoteUsers } from "../remote-users";
import { component } from "tsdi";
import { GameConfig } from "../types";

@component
export class Game {
    public users = new RemoteUsers();
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
    }

    public async initialize(config: GameConfig): Promise<void>;
    public async initialize(networkId: string): Promise<void>;
    @action.bound public async initialize(arg1?: string | GameConfig): Promise<void> {
        this.peer = typeof arg1 === "string" ? new Client() : new Host(this.users);

        this.peer.onWelcome(users => {
            this.users.add(...users);
        });
        this.peer.onUserConnected(user => {
            this.users.add(user);
        });
        this.peer.onUserDisconnected(userId => {
            this.users.remove(userId);
        }) ;
        this.peer.onGameStart(() => {
        });

        if (this.peer instanceof Host) {
            await this.peer.host();
        }
        if (this.peer instanceof Client) {
            await this.peer.connect(arg1 as string, this.users.ownUser);
        }
    }
}
