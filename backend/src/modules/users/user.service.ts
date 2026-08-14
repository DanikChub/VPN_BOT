import User from "./user.model";
import balanceService from "../balances/balance.service";
import MarketingSource from "../marketing-sources/marketing-source.model";


interface FindOrCrateTelegramUserPayload {
    telegramId: string;
    username: string | null;
    firstName: string | null;
    startPayload?:string;
}

class UserService {
    async findOrCreateTelegramUser(
        payload: FindOrCrateTelegramUserPayload,
    ) {


        let marketingSourceId:
            number | null = null;

        const organicSource =
            await MarketingSource.findOne({
                where:{
                    code:"organic",
                },
            });


        marketingSourceId =
            organicSource?.id ?? null;


        if (
            payload.startPayload &&
            payload.startPayload.startsWith("m_")
        ) {

            const code =
                payload.startPayload.replace(
                    "m_",
                    ""
                );


            const source =
                await MarketingSource.findOne({
                    where:{
                        code,
                        is_active:true,
                    },
                });


            if(source){
                marketingSourceId =
                    source.id;
            }
        }


        const [user, created] =
            await User.findOrCreate({

                where:{
                    telegramId:
                    payload.telegramId,
                },


                defaults:{

                    telegramId:
                    payload.telegramId,

                    username:
                    payload.username,

                    firstName:
                    payload.firstName,


                    marketing_source_id:
                    marketingSourceId,
                }
            });

        if(
            !created &&
            !user.marketing_source_id &&
            marketingSourceId
        ){
            user.marketing_source_id =
                marketingSourceId;

            await user.save();
        }

        return user;
    }
}

export default new UserService();