import { Types } from "mongoose";
import { PaymentMapper } from "../../application/mappers/PaymentMapper.js";
import { IPaymentRepository } from "../../domain/repositories/IPaymentRepository.js";
import { Payment, PaymentProps } from "../../domain/User/entities/Payment.js";
import { PaymentAllocation } from "../../domain/User/entities/PaymentAllocation.js";
import { PaymentStatus } from "../../domain/User/Types/BookingTypes.js";
import { ITransactionContext } from "../databases/interface/ITransactionContext.js";
import { PaymentAllocationModel } from "../databases/models/PaymentAllocationModel.js";
import { PaymentModel } from "../databases/models/PaymentModel.js";
import { MongoTransactionContext } from "../databases/MongoTransactionContext.js";

export class PaymentRepository implements IPaymentRepository {
    private getSession(transaction?: ITransactionContext) {
        return transaction instanceof MongoTransactionContext
            ? transaction.session
            : undefined;
    }

    async create(
        payment: Payment,
        transaction?: ITransactionContext
    ): Promise<Payment> {
        const data = PaymentMapper.toPersistence(payment);
        const session = this.getSession(transaction);

        if (session) {
            const [created] = await PaymentModel.create([data], { session });
            if (!created) {
                throw new Error("Failed to create payment");
            }
            return PaymentMapper.toDomain(created);
        }

        const created = await PaymentModel.create(data);
        return PaymentMapper.toDomain(created);
    }

    async findById(
        paymentId: string,
        transaction?: ITransactionContext
    ): Promise<Payment | null> {
        if (!Types.ObjectId.isValid(paymentId)) {
            return null;
        }
        const session = this.getSession(transaction);
        const query = PaymentModel.findById(paymentId);
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? PaymentMapper.toDomain(doc) : null;
    }

    async findByBookingId(
        bookingId: string,
        transaction?: ITransactionContext
    ): Promise<Payment | null> {
        if (!Types.ObjectId.isValid(bookingId)) {
            return null;
        }
        const session = this.getSession(transaction);
        const query = PaymentModel.findOne({ bookingId: new Types.ObjectId(bookingId) });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? PaymentMapper.toDomain(doc) : null;
    }

    async findLatestByBookingId(
        bookingId: string,
        transaction?: ITransactionContext
    ): Promise<Payment | null> {
        if (!Types.ObjectId.isValid(bookingId)) {
            return null;
        }
        const session = this.getSession(transaction);
        const query = PaymentModel.findOne({ bookingId: new Types.ObjectId(bookingId) })
            .sort({ createdAt: -1 });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? PaymentMapper.toDomain(doc) : null;
    }

    async findLatestByBookingIds(
        bookingIds: string[]
    ): Promise<Map<string, Payment>> {
        const result = new Map<string, Payment>();
        const validIds = bookingIds
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

        if (validIds.length === 0) {
            return result;
        }

        const docs = await PaymentModel.find({
            bookingId: { $in: validIds },
        })
            .sort({ createdAt: -1 })
            .exec();

        for (const doc of docs) {
            const key = doc.bookingId.toString();
            if (!result.has(key)) {
                result.set(key, PaymentMapper.toDomain(doc));
            }
        }

        return result;
    }

    async findByRazorpayOrderId(
        orderId: string,
        transaction?: ITransactionContext
    ): Promise<Payment | null> {
        const session = this.getSession(transaction);
        const query = PaymentModel.findOne({ razorpayOrderId: orderId });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? PaymentMapper.toDomain(doc) : null;
    }

    async findByRazorpayPaymentId(
        razorpayPaymentId: string,
        transaction?: ITransactionContext
    ): Promise<Payment | null> {
        const session = this.getSession(transaction);
        const query = PaymentModel.findOne({ razorpayPaymentId });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? PaymentMapper.toDomain(doc) : null;
    }

    async findByIdempotencyKey(
        idempotencyKey: string,
        transaction?: ITransactionContext
    ): Promise<Payment | null> {
        const session = this.getSession(transaction);
        const query = PaymentModel.findOne({ idempotencyKey });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? PaymentMapper.toDomain(doc) : null;
    }

    async updateStatus(
        paymentId: string,
        status: PaymentStatus,
        fields?: Partial<PaymentProps>,
        expectedCurrentStatuses?: PaymentStatus[],
        transaction?: ITransactionContext
    ): Promise<Payment | null> {
        if (!Types.ObjectId.isValid(paymentId)) {
            return null;
        }

        const filter: Record<string, unknown> = {
            _id: new Types.ObjectId(paymentId),
        };
        if (expectedCurrentStatuses && expectedCurrentStatuses.length > 0) {
            filter.status = { $in: expectedCurrentStatuses };
        }

        const updateFields: Record<string, unknown> = {
            status,
            ...(fields?.razorpayPaymentId !== undefined
                ? { razorpayPaymentId: fields.razorpayPaymentId }
                : {}),
            ...(fields?.razorpaySignature !== undefined
                ? { razorpaySignature: fields.razorpaySignature }
                : {}),
            ...(fields?.failureReason !== undefined
                ? { failureReason: fields.failureReason }
                : {}),
            ...(fields?.refundId !== undefined ? { refundId: fields.refundId } : {}),
            ...(fields?.paidAt !== undefined ? { paidAt: fields.paidAt } : {}),
            ...(fields?.refundedAt !== undefined
                ? { refundedAt: fields.refundedAt }
                : {}),
        };

        const session = this.getSession(transaction);
        const updated = await PaymentModel.findOneAndUpdate(
            filter,
            { $set: updateFields },
            {
                new: true,
                runValidators: true,
                ...(session ? { session } : {}),
            }
        ).exec();

        return updated ? PaymentMapper.toDomain(updated) : null;
    }

    async createAllocation(
        allocation: PaymentAllocation,
        transaction?: ITransactionContext
    ): Promise<PaymentAllocation> {
        const data = PaymentMapper.allocationToPersistence(allocation);
        const session = this.getSession(transaction);

        if (session) {
            const [created] = await PaymentAllocationModel.create([data], {
                session,
            });
            if (!created) {
                throw new Error("Failed to create payment allocation");
            }
            return PaymentMapper.allocationToDomain(created);
        }

        const created = await PaymentAllocationModel.create(data);
        return PaymentMapper.allocationToDomain(created);
    }

    async findAllocationByBookingId(
        bookingId: string,
        transaction?: ITransactionContext
    ): Promise<PaymentAllocation | null> {
        if (!Types.ObjectId.isValid(bookingId)) {
            return null;
        }
        const session = this.getSession(transaction);
        const query = PaymentAllocationModel.findOne({
            bookingId: new Types.ObjectId(bookingId),
        });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? PaymentMapper.allocationToDomain(doc) : null;
    }

    async findAllocationByPaymentId(
        paymentId: string,
        transaction?: ITransactionContext
    ): Promise<PaymentAllocation | null> {
        if (!Types.ObjectId.isValid(paymentId)) {
            return null;
        }
        const session = this.getSession(transaction);
        const query = PaymentAllocationModel.findOne({
            paymentId: new Types.ObjectId(paymentId),
        });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? PaymentMapper.allocationToDomain(doc) : null;
    }
}
