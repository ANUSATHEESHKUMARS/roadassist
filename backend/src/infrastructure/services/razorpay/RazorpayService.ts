import crypto from "crypto";
import Razorpay from "razorpay";
import {
    CreateOrderInput,
    CreateOrderResult,
    FetchPaymentResult,
    IPaymentGateway,
    RefundPaymentInput,
    RefundPaymentResult,
    VerifySignatureInput,
} from "../../../application/contracts/IPaymentGateway.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import {
    createRazorpayClient,
    getRazorpayConfig,
    RazorpayConfig,
} from "./razorpayConfig.js";

export class RazorpayService implements IPaymentGateway {
    private readonly config: RazorpayConfig;
    private readonly client: Razorpay | null;

    constructor(config?: RazorpayConfig) {
        this.config = config ?? getRazorpayConfig();
        this.client = createRazorpayClient(this.config);
    }

    getKeyId(): string {
        return this.config.keyId;
    }

    private ensureClient(): Razorpay {
        if (!this.client || !this.config.keyId || !this.config.keySecret) {
            throw new BadRequest(
                "Razorpay payment gateway is not configured",
                "PAYMENT_GATEWAY_NOT_CONFIGURED"
            );
        }
        return this.client;
    }

    async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
        const client = this.ensureClient();

        const order = await client.orders.create({
            amount: input.amountPaise,
            currency: input.currency,
            receipt: input.receipt,
            ...(input.notes ? { notes: input.notes } : {}),
        });

        return {
            orderId: order.id,
            amount: Number(order.amount),
            currency: order.currency,
            receipt: order.receipt ?? input.receipt,
            status: order.status,
        };
    }

    verifyPaymentSignature(input: VerifySignatureInput): boolean {
        if (!this.config.keySecret) {
            return false;
        }
        if (!input.orderId || !input.paymentId || !input.signature) {
            return false;
        }

        const expected = crypto
            .createHmac("sha256", this.config.keySecret)
            .update(`${input.orderId}|${input.paymentId}`)
            .digest("hex");

        const expectedBuf = Buffer.from(expected, "utf8");
        const actualBuf = Buffer.from(input.signature, "utf8");

        if (expectedBuf.length !== actualBuf.length) {
            return false;
        }

        return crypto.timingSafeEqual(expectedBuf, actualBuf);
    }

    verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
        if (!this.config.webhookSecret || !signature) {
            return false;
        }

        const payload = Buffer.isBuffer(rawBody)
            ? rawBody
            : Buffer.from(rawBody, "utf8");

        const expected = crypto
            .createHmac("sha256", this.config.webhookSecret)
            .update(payload)
            .digest("hex");

        const expectedBuf = Buffer.from(expected, "utf8");
        const actualBuf = Buffer.from(signature, "utf8");

        if (expectedBuf.length !== actualBuf.length) {
            return false;
        }

        return crypto.timingSafeEqual(expectedBuf, actualBuf);
    }

    async fetchPayment(paymentId: string): Promise<FetchPaymentResult> {
        const client = this.ensureClient();
        const payment = await client.payments.fetch(paymentId);

        return {
            paymentId: payment.id,
            orderId: payment.order_id ?? "",
            status: payment.status,
            amount: Number(payment.amount),
            currency: payment.currency,
            captured: Boolean(payment.captured),
        };
    }

    async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
        const client = this.ensureClient();
        const refund = await client.payments.refund(input.paymentId, {
            ...(input.amountPaise !== undefined ? { amount: input.amountPaise } : {}),
            ...(input.notes ? { notes: input.notes } : {}),
        });

        return {
            refundId: refund.id,
            paymentId: refund.payment_id ?? input.paymentId,
            amount: Number(refund.amount ?? input.amountPaise ?? 0),
            status: refund.status ?? "pending",
        };
    }
}

