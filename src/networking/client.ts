import PeerJS from "peerjs";
import { Peer } from "./peer";
import { bind } from "bind-decorator";
import { ClientMessage, RemoteUser } from "../types";

export class Client extends Peer {
    private connection?: PeerJS.DataConnection;

    @bind protected sendClientMessage(message: ClientMessage): void {
        if (!this.connection) { throw new Error("Can't send message: Connection is closed."); }
        this.sendToPeer(this.connection, message);
    }

    @bind public async connect(networkId: string, ownUser: RemoteUser): Promise<void> {
        await this.open();
        await new Promise(resolve => {
            this.connection = this.peer!.connect(networkId!, { reliable: true });
            this.connection.on("open", () => {
                this.connection!.on("data", data => this.handleHostMessage(data));
                this.sendHello(ownUser);
                resolve();
            });
        });
        this.networkId = networkId;
    }
}

export async function createClient(networkId: string, user: RemoteUser): Promise<Client> {
    const client = new Client();
    await client.connect(networkId, user);
    return client;
}