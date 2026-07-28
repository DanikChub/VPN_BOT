import {
    XrayApiClient,
} from "./api/xray-api.client.js";


export interface AddXrayUserInput {

    inboundTag: string;

    uuid: string;

    email: string;

    flow:
        "xtls-rprx-vision";

}



export class XrayUserService {


    constructor(
        private readonly api:
        XrayApiClient,
    ) {}



    async addUser(
        input:AddXrayUserInput,
    ):Promise<void>{


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

}