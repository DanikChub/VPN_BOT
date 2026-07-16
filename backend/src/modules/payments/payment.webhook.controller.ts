import {
    Request,
    Response
} from "express";

import paymentService from "./payment.service";


class PaymentWebhookController {


    async crypto(
        req:Request,
        res:Response
    ){

        const update =
            req.body;


        if(
            update.update_type !==
            "invoice_paid"
        ){
            res.sendStatus(200);
            return;
        }


        const invoice =
            update.payload;


        const data =
            JSON.parse(
                invoice.payload
            );


        await paymentService.markSuccessful(
            data.paymentId
        );


        res.sendStatus(200);

    }


}


export default new PaymentWebhookController();