export interface CreateOrderInput {
    amountPaise: number;
    currency: string;
    receipt: string;
    notes?: Record<string, string>;
}

export interface CreateOrderResult {
    orderId: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
}

export interface VerifySignatureInput {
    orderId: string;
    paymentId: string;
    signature: string;
}

export interface FetchPaymentResult {
    paymentId: string;
    orderId: string;
    status: string;
    amount: number;
    currency: string;
    captured: boolean;
}

export interface RefundPaymentInput {
    paymentId: string;
    amountPaise?: number;
    notes?: Record<string, string>;
}

export interface RefundPaymentResult {
    refundId: string;
    paymentId: string;
    amount: number;
    status: string;
}

export interface IPaymentGateway {
    getKeyId(): string;
    createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
    verifyPaymentSignature(input: VerifySignatureInput): boolean;
    verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean;
    fetchPayment(paymentId: string): Promise<FetchPaymentResult>;
    refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
}

