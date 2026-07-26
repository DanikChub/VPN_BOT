import {MessageType} from "./message-type.js";

export interface InitialSyncMessage {

    type:
        MessageType.INITIAL_SYNC;


    payload: {

        xray: {

            port:number;

            inboundTag:string;

            serverName:string;

        };


        users: {

            uuid:string;

            email:string;

        }[];

    };

}

export interface SyncResultMessage {

    type:
        MessageType.SYNC_RESULT;


    payload: {

        success:boolean;


        error?:string;


    };

}