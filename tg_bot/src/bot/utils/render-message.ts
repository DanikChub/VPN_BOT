import {
    Context,
} from "telegraf";

export async function answerCallback(
    ctx: Context,
    text?: string
): Promise<void> {
    if (!ctx.callbackQuery) {
        return;
    }

    try {
        await ctx.answerCbQuery(text);
    } catch (error) {
        console.error(
            "ANSWER CALLBACK ERROR:",
            error
        );
    }
}

export async function renderMessage(
    ctx: Context,
    text: string,
    keyboard: object = {}
): Promise<void> {
    if (ctx.callbackQuery) {
        try {
            await ctx.editMessageText(
                text,
                keyboard
            );

            return;
        } catch (error: any) {
            const description =
                error?.description ??
                error?.response?.description ??
                "";

            if (
                description.includes(
                    "message is not modified"
                )
            ) {
                return;
            }

            console.error(
                "EDIT MESSAGE ERROR:",
                description || error
            );
        }
    }

    await ctx.reply(
        text,
        keyboard
    );
}