import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import protobuf from "protobufjs";
import path from "node:path";

import {
    fileURLToPath,
} from "node:url";

import {
    loadXrayProto,
} from "./proto-loader.js";


export interface XrayApiUser {
    uuid: string;
    email: string;
    flow?: "xtls-rprx-vision";
}


export class XrayApiClient {

    private readonly handlerService: any;

    private proto:
        protobuf.Root | null = null;


    constructor(
        address = "127.0.0.1:10085",
    ) {

        const currentDirectory =
            path.dirname(
                fileURLToPath(
                    import.meta.url,
                ),
            );


        const protoRoot =
            path.resolve(
                currentDirectory,
                "proto",
            );


        const commandProto =
            path.join(
                protoRoot,
                "app",
                "proxyman",
                "command",
                "command.proto",
            );


        const packageDefinition =
            protoLoader.loadSync(
                commandProto,
                {
                    keepCase:
                        true,

                    longs:
                    String,

                    enums:
                    String,

                    defaults:
                        true,

                    includeDirs: [
                        protoRoot,
                    ],
                },
            );


        const loaded =
            grpc.loadPackageDefinition(
                packageDefinition,
            ) as any;


        this.handlerService =
            new loaded.xray.app.proxyman.command.HandlerService(
                address,
                grpc.credentials.createInsecure(),
            );
    }


    private async getProto():
        Promise<protobuf.Root> {

        if (!this.proto) {
            this.proto =
                await loadXrayProto();
        }

        return this.proto;
    }


    async addUser(
        inboundTag: string,
        user: XrayApiUser,
    ): Promise<void> {

        const root =
            await this.getProto();


        const Account =
            root.lookupType(
                "xray.proxy.vless.Account",
            );


        const accountData: {
            id: string;
            flow?: string;
        } = {
            id:
            user.uuid,
        };


        if (user.flow) {
            accountData.flow =
                user.flow;
        }


        const accountMessage =
            Account.create(
                accountData,
            );


        const accountBytes =
            Account.encode(
                accountMessage,
            ).finish();


        const User =
            root.lookupType(
                "xray.common.protocol.User",
            );


        const userMessage =
            User.create({
                email:
                user.email,

                account: {
                    type:
                        "xray.proxy.vless.Account",

                    value:
                    accountBytes,
                },
            });


        const AddUserOperation =
            root.lookupType(
                "xray.app.proxyman.command.AddUserOperation",
            );


        const operationMessage =
            AddUserOperation.create({
                user:
                userMessage,
            });


        const operationBytes =
            AddUserOperation.encode(
                operationMessage,
            ).finish();


        const typedOperation =
            this.createTypedOperation(
                root,
                "xray.app.proxyman.command.AddUserOperation",
                operationBytes,
            );

        console.log({
            inboundTag,
            user,
        });
        try {
            await this.alterInbound(
                inboundTag,
                typedOperation,
            );
        } catch (error) {

            if (this.isUserAlreadyExistsError(error)) {
                return;
            }

            throw error;
        }
    }


    async removeUser(
        inboundTag: string,
        email: string,
    ): Promise<void> {

        const root =
            await this.getProto();


        const RemoveUserOperation =
            root.lookupType(
                "xray.app.proxyman.command.RemoveUserOperation",
            );


        const operationMessage =
            RemoveUserOperation.create({
                email,
            });


        const operationBytes =
            RemoveUserOperation.encode(
                operationMessage,
            ).finish();


        const typedOperation =
            this.createTypedOperation(
                root,
                "xray.app.proxyman.command.RemoveUserOperation",
                operationBytes,
            );


        try {
            await this.alterInbound(
                inboundTag,
                typedOperation,
            );
        } catch (error) {

            if (this.isUserMissingError(error)) {
                return;
            }

            throw error;
        }
    }


    private createTypedOperation(
        root: protobuf.Root,
        type: string,
        value: Uint8Array,
    ): protobuf.Message {

        const TypedMessage =
            root.lookupType(
                "xray.common.serial.TypedMessage",
            );


        return TypedMessage.create({
            type,
            value,
        });
    }


    private alterInbound(
        inboundTag: string,
        operation: protobuf.Message,
    ): Promise<void> {

        return new Promise<void>(
            (
                resolve,
                reject,
            ) => {

                this.handlerService.AlterInbound(
                    {
                        tag:
                        inboundTag,

                        operation,
                    },

                    (
                        error:
                            grpc.ServiceError | null,
                    ) => {

                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve();
                    },
                );
            },
        );
    }


    private isUserAlreadyExistsError(
        error: unknown,
    ): boolean {

        const message =
            this.getErrorMessage(
                error,
            ).toLowerCase();


        return (
            message.includes(
                "already exists",
            )
        );
    }


    private isUserMissingError(
        error: unknown,
    ): boolean {

        const message =
            this.getErrorMessage(
                error,
            ).toLowerCase();


        return (
            message.includes("not found") ||
            message.includes("does not exist") ||
            message.includes("not exist") ||
            message.includes("no such user")
        );
    }


    private getErrorMessage(
        error: unknown,
    ): string {

        if (
            typeof error === "object" &&
            error !== null
        ) {

            const grpcError =
                error as Partial<
                    grpc.ServiceError
                >;


            const parts = [
                grpcError.message,
                grpcError.details,
            ].filter(
                (
                    value,
                ): value is string =>
                    typeof value === "string",
            );


            if (parts.length > 0) {
                return parts.join(" ");
            }
        }


        return String(
            error,
        );
    }
}