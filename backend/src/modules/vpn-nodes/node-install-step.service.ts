import NodeInstallLog, {
    NodeInstallStep,
} from "./node-install-log.model";


class NodeInstallStepService {


    async run<T>(
        nodeId:number,
        step:NodeInstallStep,
        callback:()=>Promise<T>,
    ){



        const log =
            await NodeInstallLog.create({

                node_id:nodeId,

                step,

                status:"running",

            });
        console.log(`[PROVISIONING} install node ${nodeId} on step "${step}" is running`);

        try{
            const result =
                await callback();

            await log.update({

                status:"success",

                message:"Completed successfully",

            });
            console.log(`[PROVISIONING} install node ${nodeId} on step "${step}" is successfull`);

            return result;
        }
        catch(error){
            await log.update({

                status:"failed",

                error:
                    error instanceof Error
                        ?
                        error.message
                        :
                        String(error),

            });
            console.error(`[PROVISIONING} install node ${nodeId} on step "${step}" is error`);
            console.error(error);
            throw error;

        }



    }


}


export default new NodeInstallStepService();