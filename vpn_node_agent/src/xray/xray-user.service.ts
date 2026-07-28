import {
    XrayApiClient,
    type XrayApiUser,
} from "./api/xray-api.client.js";


export interface AddXrayUserInput {
    inboundTag: string;
    uuid: string;
    email: string;
    flow: "xtls-rprx-vision";
}


export interface RemoveXrayUserInput {
    inboundTag: string;
    email: string;
}


export interface SyncXrayUsersInput {
    inboundTag: string;

    /*
     * Полный список пользователей,
     * которые должны находиться в Xray.
     */
    desiredUsers: XrayApiUser[];

    /*
     * Пользователи, которых агент считает
     * ранее применёнными к Xray.
     */
    knownEmails: string[];

    /*
     * reconcile:
     * применяем только разницу.
     *
     * rebuild:
     * считаем, что runtime Xray мог быть потерян,
     * и добавляем desiredUsers заново.
     */
    mode:
        | "reconcile"
        | "rebuild";
}


export interface SyncXrayUsersResult {
    mode:
        | "reconcile"
        | "rebuild";

    desiredEmails: string[];

    addedEmails: string[];

    removedEmails: string[];

    totalUsers: number;
}


export class XrayUserService {

    constructor(
        private readonly api:
        XrayApiClient,
    ) {}


    async addUser(
        input: AddXrayUserInput,
    ): Promise<void> {

        await this.api.addUser(
            input.inboundTag,
            {
                uuid:
                input.uuid,

                email:
                input.email,

                flow:
                input.flow,
            },
        );
    }


    async removeUser(
        input: RemoveXrayUserInput,
    ): Promise<void> {

        await this.api.removeUser(
            input.inboundTag,
            input.email,
        );
    }


    async syncUsers(
        input: SyncXrayUsersInput,
    ): Promise<SyncXrayUsersResult> {

        const desiredUsers =
            this.normalizeUsers(
                input.desiredUsers,
            );


        const desiredEmailSet =
            new Set(
                desiredUsers.map(
                    user =>
                        user.email,
                ),
            );


        const knownEmailSet =
            new Set(
                input.knownEmails
                    .map(
                        email =>
                            email.trim(),
                    )
                    .filter(Boolean),
            );


        const emailsToRemove =
            input.mode === "rebuild"
                ? Array.from(
                    knownEmailSet,
                )
                : Array.from(
                    knownEmailSet,
                ).filter(
                    email =>
                        !desiredEmailSet.has(
                            email,
                        ),
                );


        const usersToAdd =
            input.mode === "rebuild"
                ? desiredUsers
                : desiredUsers.filter(
                    user =>
                        !knownEmailSet.has(
                            user.email,
                        ),
                );


        const removedEmails:
            string[] = [];

        const addedEmails:
            string[] = [];


        /*
         * Сначала удаляем лишних или старых пользователей.
         *
         * Выполняем последовательно, а не Promise.all,
         * чтобы не устраивать несколько одновременных
         * AlterInbound над одним inbound.
         */
        for (
            const email
            of emailsToRemove
            ) {

            await this.api.removeUser(
                input.inboundTag,
                email,
            );


            removedEmails.push(
                email,
            );
        }


        /*
         * Затем добавляем недостающих пользователей.
         */
        for (
            const user
            of usersToAdd
            ) {

            await this.api.addUser(
                input.inboundTag,
                user,
            );


            addedEmails.push(
                user.email,
            );
        }


        return {
            mode:
            input.mode,

            desiredEmails:
                desiredUsers.map(
                    user =>
                        user.email,
                ),

            addedEmails,

            removedEmails,

            totalUsers:
            desiredUsers.length,
        };
    }


    private normalizeUsers(
        users: XrayApiUser[],
    ): XrayApiUser[] {

        const usersByEmail =
            new Map<
                string,
                XrayApiUser
            >();


        for (const user of users) {

            const email =
                user.email.trim();


            const uuid =
                user.uuid.trim();


            if (!email) {
                throw new Error(
                    "Xray user email is required",
                );
            }


            if (!uuid) {
                throw new Error(
                    `Xray user UUID is required: ${email}`,
                );
            }


            usersByEmail.set(
                email,
                {
                    uuid,

                    email,

                    flow:
                    user.flow,
                },
            );
        }


        return Array.from(
            usersByEmail.values(),
        );
    }
}