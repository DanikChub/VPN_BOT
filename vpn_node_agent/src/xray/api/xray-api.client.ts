import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import protobuf from "protobufjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
    loadXrayProto,
} from "./proto-loader.js";



export class XrayApiClient {


    private readonly handlerService:any;

    private proto:
        protobuf.Root | null = null;



    constructor(
        address="127.0.0.1:10085",
    ){


        const __dirname =
            path.dirname(
                fileURLToPath(import.meta.url)
            );


        const protoRoot =
            path.resolve(
                __dirname,
                "proto",
            );


        const commandProto =
            path.join(
                protoRoot,
                "app/proxyman/command/command.proto",
            );

        const packageDefinition =
            protoLoader.loadSync(
                commandProto,
                {
                    keepCase: true,

                    longs: String,

                    enums: String,

                    defaults: true,

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





    private async getProto(){

        if(!this.proto){
            this.proto =
                await loadXrayProto();
        }


        return this.proto;
    }





    async addUser(
        inboundTag:string,
        user:{
            uuid:string;
            email:string;
            flow:string;
        },
    ){


        const root =
            await this.getProto();



        const Account =
            root.lookupType(
                "xray.proxy.vless.Account",
            );


        const accountMessage =
            Account.create({

                id:
                user.uuid,

                flow:
                user.flow,
            });



        const accountBytes =
            Account.encode(
                accountMessage,
            ).finish();




        const TypedMessage =
            root.lookupType(
                "xray.common.serial.TypedMessage",
            );



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




        const userBytes =
            User.encode(
                userMessage,
            ).finish();





        const AddUserOperation =
            root.lookupType(
                "xray.app.proxyman.command.AddUserOperation",
            );



        const operation =
            AddUserOperation.create({

                user:
                userMessage,

            });



        const operationBytes =
            AddUserOperation.encode(
                operation,
            ).finish();




        const typedOperation =
            TypedMessage.create({

                type:
                    "xray.app.proxyman.command.AddUserOperation",


                value:
                operationBytes,

            });




        return new Promise<void>(
            (
                resolve,
                reject,
            )=>{


                this.handlerService.AlterInbound(

                    {
                        tag:
                        inboundTag,


                        operation:
                        typedOperation,
                    },


                    (
                        error:any,
                    )=>{

                        if(error){
                            reject(error);
                            return;
                        }


                        resolve();
                    }
                );

            }
        );
    }

}