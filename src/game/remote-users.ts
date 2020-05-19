import { observable, computed, action } from "mobx";
import { RemoteUser } from "../types";
import { v4 } from "uuid";
import { generateUserName } from "../utils";

export class RemoteUsers {
    @observable public users = new Map<string, RemoteUser>();

    private ownId: string;

    constructor() {
        const user: RemoteUser = {
            id: v4(),
            name: generateUserName(),
        };
        this.users.set(user.id, user);
        this.ownId = user.id;
    }

    @computed public get ownUser(): RemoteUser {
        return this.getUser(this.ownId)!;
    }

    @action.bound public remove(userId: string): void {
        this.users.delete(userId);
    }

    @action.bound public add(...users: RemoteUser[]): void {
        users.forEach(user => this.users.set(user.id, user));
    }

    @computed public get all(): RemoteUser[] {
        return Array.from(this.users.values());
    }

    @computed public get count(): number {
        return this.all.length;
    }

    public getUser(id: string): RemoteUser | undefined {
        return this.users.get(id);
    }

    @action.bound public setOwnUser(user: RemoteUser): void {
        this.users.set(this.ownId, user);
    }
}
