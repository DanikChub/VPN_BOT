import {
    type XrayApiUser,
} from "./api/xray-api.client.js";


/*
 * Это не источник истины.
 *
 * Источник истины — backend/PostgreSQL.
 *
 * Store хранит только локальное представление того,
 * какие пользователи агент успешно применил к Xray
 * в рамках текущего запуска процесса.
 */
export class XrayAppliedUsersStore {

    private readonly usersByInbound =
        new Map<
            string,
            Map<string, XrayApiUser>
        >();


    getUsers(
        inboundTag: string,
    ): XrayApiUser[] {

        const users =
            this.usersByInbound.get(
                inboundTag,
            );


        if (!users) {
            return [];
        }


        return Array.from(
            users.values(),
        );
    }


    getEmails(
        inboundTag: string,
    ): string[] {

        return this.getUsers(
            inboundTag,
        ).map(
            user =>
                user.email,
        );
    }


    hasUser(
        inboundTag: string,
        email: string,
    ): boolean {

        return (
            this.usersByInbound
                .get(inboundTag)
                ?.has(email)
            ?? false
        );
    }


    addUser(
        inboundTag: string,
        user: XrayApiUser,
    ): void {

        const inboundUsers =
            this.getOrCreateInboundUsers(
                inboundTag,
            );


        inboundUsers.set(
            user.email,
            {
                ...user,
            },
        );
    }


    removeUser(
        inboundTag: string,
        email: string,
    ): void {

        const inboundUsers =
            this.usersByInbound.get(
                inboundTag,
            );


        if (!inboundUsers) {
            return;
        }


        inboundUsers.delete(
            email,
        );


        if (inboundUsers.size === 0) {
            this.usersByInbound.delete(
                inboundTag,
            );
        }
    }


    replaceUsers(
        inboundTag: string,
        users: XrayApiUser[],
    ): void {

        const usersByEmail =
            new Map<
                string,
                XrayApiUser
            >();


        for (const user of users) {
            usersByEmail.set(
                user.email,
                {
                    ...user,
                },
            );
        }


        this.usersByInbound.set(
            inboundTag,
            usersByEmail,
        );
    }


    clearInbound(
        inboundTag: string,
    ): void {

        this.usersByInbound.delete(
            inboundTag,
        );
    }


    clear(): void {

        this.usersByInbound.clear();
    }


    private getOrCreateInboundUsers(
        inboundTag: string,
    ): Map<string, XrayApiUser> {

        const existingUsers =
            this.usersByInbound.get(
                inboundTag,
            );


        if (existingUsers) {
            return existingUsers;
        }


        const users =
            new Map<
                string,
                XrayApiUser
            >();


        this.usersByInbound.set(
            inboundTag,
            users,
        );


        return users;
    }
}