import { Request, Response } from "express";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IHandlePaymentWebhookUseCase } from "../../../application/interfaces/booking/IScheduledBookingUseCases.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";

type RequestWithRawBody = Request & { rawBody?: Buffer };

export class RazorpayWebhookController {
    constructor(
        private readonly handlePaymentWebhookUseCase: IHandlePaymentWebhookUseCase
    ) {}

    handle = async (req: Request, res: Response): Promise<void> => {
        const signatureHeader = req.headers["x-razorpay-signature"];
        const signature =
            typeof signatureHeader === "string" ? signatureHeader : "";

        const rawBody = (req as RequestWithRawBody).rawBody;
        if (!rawBody) {
            throw new BadRequest(
                "Raw webhook payload is required for signature verification",
                "MISSING_RAW_BODY"
            );
        }

        const result = await this.handlePaymentWebhookUseCase.execute(
            rawBody,
            signature,
            req.body
        );

        const response: CommonResponse<typeof result> = {
            success: true,
            message: result.message,
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };
}

