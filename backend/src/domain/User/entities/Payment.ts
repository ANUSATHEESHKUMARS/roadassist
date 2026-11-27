import { PaymentStatus } from "../Types/BookingTypes.js";

export interface PaymentProps {
    id?: string;
    bookingId: string;
    userId: string;
    mechanicId: string;
    amount: number;
    amountPaise: number;
    currency: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string | undefined;
    razorpaySignature?: string | undefined;
    status: PaymentStatus;
    idempotencyKey: string;
    failureReason?: string | undefined;
    refundId?: string | undefined;
    paidAt?: Date | undefined;
    refundedAt?: Date | undefined;
    metadata?: Record<string, string> | undefined;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Payment {
    private constructor(private readonly props: PaymentProps) {}

    static create(props: PaymentProps): Payment {
        return new Payment(props);
    }

    get id(): string | undefined {
        return this.props.id;
    }

    get bookingId(): string {
        return this.props.bookingId;
    }

    get userId(): string {
        return this.props.userId;
    }

    get mechanicId(): string {
        return this.props.mechanicId;
    }

    get amount(): number {
        return this.props.amount;
    }

    get amountPaise(): number {
        return this.props.amountPaise;
    }

    get currency(): string {
        return this.props.currency;
    }

    get razorpayOrderId(): string {
        return this.props.razorpayOrderId;
    }

    get razorpayPaymentId(): string | undefined {
        return this.props.razorpayPaymentId;
    }

    get razorpaySignature(): string | undefined {
        return this.props.razorpaySignature;
    }

    get status(): PaymentStatus {
        return this.props.status;
    }

    get idempotencyKey(): string {
        return this.props.idempotencyKey;
    }

    get failureReason(): string | undefined {
        return this.props.failureReason;
    }

    get refundId(): string | undefined {
        return this.props.refundId;
    }

    get paidAt(): Date | undefined {
        return this.props.paidAt;
    }

    get refundedAt(): Date | undefined {
        return this.props.refundedAt;
    }

    get metadata(): Record<string, string> | undefined {
        return this.props.metadata;
    }

    get createdAt(): Date | undefined {
        return this.props.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }

    toObject(): PaymentProps {
        return { ...this.props };
    }
}

