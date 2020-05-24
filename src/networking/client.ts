import PeerJS from "peerjs";
import { Peer } from "./peer";
import { bind } from "bind-decorator";
import { ClientMessage } from "../types";
import { RemoteUsers } from "../game";

export class Client extends Peer {
    private connection?: PeerJS.DataConnection;

    @bind protected sendClientMessage(message: ClientMessage): void {
        if (!this.connection) { throw new Error("Can't send message: Connection is closed."); }
        this.sendToPeer(this.connection, { ...message, originPeerId: this.peerId, originUserId: this.remoteUsers.ownUser.id });
    }

    @bind public async connect(networkId: string): Promise<void> {
        await this.open();
        await new Promise(resolve => {
            this.connection = this.peer!.connect(networkId!);
            this.connection.on("open", () => {
                this.connection!.on("data", data => this.handleHostMessage(data));
                this.sendHello(this.remoteUsers.ownUser);
                resolve();
            });
        });
        this.networkId = networkId;
    }
}

export async function createClient(networkId: string, users: RemoteUsers): Promise<Client> {
    const client = new Client(users);
    await client.connect(networkId);
    return client;
}