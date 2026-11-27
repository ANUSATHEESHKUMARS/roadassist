import { Payment, PaymentProps } from "../User/entities/Payment.js";
import { PaymentAllocation } from "../User/entities/PaymentAllocation.js";
import { PaymentStatus } from "../User/Types/BookingTypes.js";
import { ITransactionContext } from "../../infrastructure/databases/interface/ITransactionContext.js";

export interface IPaymentRepository {
    create(payment: Payment, transaction?: ITransactionContext): Promise<Payment>;

    findById(paymentId: string, transaction?: ITransactionContext): Promise<Payment | null>;

    findByBookingId(bookingId: string, transaction?: ITransactionContext): Promise<Payment | null>;

    findLatestByBookingId(bookingId: string, transaction?: ITransactionContext): Promise<Payment | null>;

    findLatestByBookingIds(bookingIds: string[]): Promise<Map<string, Payment>>;

    findByRazorpayOrderId(orderId: string, transaction?: ITransactionContext): Promise<Payment | null>;

    findByRazorpayPaymentId(razorpayPaymentId: string, transaction?: ITransactionContext): Promise<Payment | null>;

    findByIdempotencyKey(idempotencyKey: string, transaction?: ITransactionContext): Promise<Payment | null>;

    updateStatus(
        paymentId: string,
        status: PaymentStatus,
        fields?: Partial<PaymentProps>,
        expectedCurrentStatuses?: PaymentStatus[],
        transaction?: ITransactionContext
    ): Promise<Payment | null>;

    createAllocation(
        allocation: PaymentAllocation,
        transaction?: ITransactionContext
    ): Promise<PaymentAllocation>;

    findAllocationByBookingId(
        bookingId: string,
        transaction?: ITransactionContext
    ): Promise<PaymentAllocation | null>;

    findAllocationByPaymentId(
        paymentId: string,
        transaction?: ITransactionContext
    ): Promise<PaymentAllocation | null>;
}

