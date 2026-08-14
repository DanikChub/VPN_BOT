import {
    Op,
} from "sequelize";



import {
    CreateMarketingSourceDto,
    GetMarketingSourcesQuery,
    UpdateMarketingSourceDto,
} from "./marketing-source.types";
import MarketingSource from "../../marketing-sources/marketing-source.model";
import User from "../../users/user.model";


class MarketingSourceService {

    private getTelegramLink(
        code: string
    ): string {

        const botUsername =
            process.env.TELEGRAM_BOT_USERNAME
            ?? "vpn_iordan_bot";

        return (
            `https://t.me/${botUsername}` +
            `?start=m_${code}`
        );
    }


    private serialize(
        source: MarketingSource,
        usersCount?: number
    ) {

        return {
            id: source.id,

            name: source.name,
            code: source.code,
            type: source.type,

            is_active: source.is_active,

            telegram_link:
                this.getTelegramLink(
                    source.code
                ),

            users_count:
            usersCount,

            created_at:
            source.created_at,

            updated_at:
            source.updated_at,
        };
    }


    async getAll(
        query: GetMarketingSourcesQuery = {}
    ) {

        const where: any = {};


        if (
            query.is_active !== undefined
        ) {
            where.is_active =
                query.is_active;
        }


        if (query.type) {
            where.type =
                query.type;
        }


        if (query.search) {
            where[Op.or] = [
                {
                    name: {
                        [Op.iLike]:
                            `%${query.search}%`,
                    },
                },
                {
                    code: {
                        [Op.iLike]:
                            `%${query.search}%`,
                    },
                },
            ];
        }


        const sources =
            await MarketingSource.findAll({
                where,

                order: [
                    [
                        "created_at",
                        "DESC",
                    ],
                ],
            });


        const result =
            await Promise.all(
                sources.map(
                    async (source) => {

                        const usersCount =
                            await User.count({
                                where: {
                                    marketing_source_id:
                                    source.id,
                                },
                            });


                        return this.serialize(
                            source,
                            usersCount
                        );
                    }
                )
            );


        return result;
    }


    async getById(
        id: number
    ) {

        const source =
            await MarketingSource.findByPk(
                id
            );


        if (!source) {
            return null;
        }


        const usersCount =
            await User.count({
                where: {
                    marketing_source_id:
                    source.id,
                },
            });


        return this.serialize(
            source,
            usersCount
        );
    }


    async create(
        dto: CreateMarketingSourceDto
    ) {

        const code =
            this.normalizeCode(
                dto.code
            );


        this.validateCode(code);


        const exists =
            await MarketingSource.findOne({
                where: {
                    code,
                },
            });


        if (exists) {
            throw new Error(
                "MARKETING_SOURCE_CODE_EXISTS"
            );
        }


        const source =
            await MarketingSource.create({
                name: dto.name.trim(),

                code,

                type: dto.type,
            });


        return this.serialize(
            source,
            0
        );
    }


    async update(
        id: number,
        dto: UpdateMarketingSourceDto
    ) {

        const source =
            await MarketingSource.findByPk(
                id
            );


        if (!source) {
            return null;
        }


        if (
            dto.name !== undefined
        ) {
            source.name =
                dto.name.trim();
        }


        if (
            dto.type !== undefined
        ) {
            source.type =
                dto.type;
        }


        if (
            dto.is_active !== undefined
        ) {
            source.is_active =
                dto.is_active;
        }


        if (
            dto.code !== undefined
        ) {

            const code =
                this.normalizeCode(
                    dto.code
                );


            this.validateCode(code);


            const existing =
                await MarketingSource.findOne({
                    where: {
                        code,

                        id: {
                            [Op.ne]: id,
                        },
                    },
                });


            if (existing) {
                throw new Error(
                    "MARKETING_SOURCE_CODE_EXISTS"
                );
            }


            source.code = code;
        }


        await source.save();


        const usersCount =
            await User.count({
                where: {
                    marketing_source_id:
                    source.id,
                },
            });


        return this.serialize(
            source,
            usersCount
        );
    }


    async archive(
        id: number
    ) {

        const source =
            await MarketingSource.findByPk(
                id
            );


        if (!source) {
            return null;
        }


        source.is_active = false;

        await source.save();


        const usersCount =
            await User.count({
                where: {
                    marketing_source_id:
                    source.id,
                },
            });


        return this.serialize(
            source,
            usersCount
        );
    }


    async restore(
        id: number
    ) {

        const source =
            await MarketingSource.findByPk(
                id
            );


        if (!source) {
            return null;
        }


        source.is_active = true;

        await source.save();


        const usersCount =
            await User.count({
                where: {
                    marketing_source_id:
                    source.id,
                },
            });


        return this.serialize(
            source,
            usersCount
        );
    }


    private normalizeCode(
        code: string
    ): string {

        return code
            .trim()
            .toLowerCase();
    }


    private validateCode(
        code: string
    ): void {

        if (!code) {
            throw new Error(
                "MARKETING_SOURCE_CODE_REQUIRED"
            );
        }


        /*
         * Telegram payload будет:
         *
         * m_${code}
         *
         * Поэтому ограничиваем код
         * безопасными символами.
         */
        if (
            !/^[a-z0-9_-]+$/.test(
                code
            )
        ) {
            throw new Error(
                "MARKETING_SOURCE_CODE_INVALID"
            );
        }


        /*
         * Оставляем место под m_
         */
        if (
            code.length > 60
        ) {
            throw new Error(
                "MARKETING_SOURCE_CODE_TOO_LONG"
            );
        }
    }

    async getUsers(
        id:number
    ) {

        const source =
            await MarketingSource.findByPk(
                id
            );


        if(!source){
            return null;
        }


        const users =
            await User.findAll({
                where:{
                    marketing_source_id:
                    id,
                },

                attributes:[
                    "id",
                    "telegramId",
                    "username",
                    "firstName",
                    "createdAt",
                ],

                order:[
                    [
                        "created_at",
                        "DESC",
                    ],
                ],
            });


        return {
            source:{
                id:source.id,
                name:source.name,
                code:source.code,
                type:source.type,
            },

            users,
        };
    }
}


export default
new MarketingSourceService();