import { Payment } from "../../domain/User/entities/Payment.js";
import { PaymentAllocation } from "../../domain/User/entities/PaymentAllocation.js";
import { IPaymentDocument } from "../../infrastructure/databases/models/PaymentModel.js";
import { IPaymentAllocationDocument } from "../../infrastructure/databases/models/PaymentAllocationModel.js";

export class PaymentMapper {
    static toDomain(document: IPaymentDocument): Payment {
        const metadataRecord = document.metadata
            ? Object.fromEntries(document.metadata.entries())
            : undefined;

        return Payment.create({
            id: document._id.toString(),
            bookingId: document.bookingId.toString(),
            userId: document.userId.toString(),
            mechanicId: document.mechanicId.toString(),
            amount: document.amount,
            amountPaise: document.amountPaise,
            currency: document.currency,
            razorpayOrderId: document.razorpayOrderId,
            ...(document.razorpayPaymentId !== undefined
                ? { razorpayPaymentId: document.razorpayPaymentId }
                : {}),
            ...(document.razorpaySignature !== undefined
                ? { razorpaySignature: document.razorpaySignature }
                : {}),
            status: document.status,
            idempotencyKey: document.idempotencyKey,
            ...(document.failureReason !== undefined
                ? { failureReason: document.failureReason }
                : {}),
            ...(document.refundId !== undefined
                ? { refundId: document.refundId }
                : {}),
            ...(document.paidAt !== undefined ? { paidAt: document.paidAt } : {}),
            ...(document.refundedAt !== undefined
                ? { refundedAt: document.refundedAt }
                : {}),
            ...(metadataRecord !== undefined ? { metadata: metadataRecord } : {}),
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        });
    }

    static toPersistence(payment: Payment) {
        return {
            bookingId: payment.bookingId,
            userId: payment.userId,
            mechanicId: payment.mechanicId,
            amount: payment.amount,
            amountPaise: payment.amountPaise,
            currency: payment.currency,
            razorpayOrderId: payment.razorpayOrderId,
            ...(payment.razorpayPaymentId !== undefined
                ? { razorpayPaymentId: payment.razorpayPaymentId }
                : {}),
            ...(payment.razorpaySignature !== undefined
                ? { razorpaySignature: payment.razorpaySignature }
                : {}),
            status: payment.status,
            idempotencyKey: payment.idempotencyKey,
            ...(payment.failureReason !== undefined
                ? { failureReason: payment.failureReason }
                : {}),
            ...(payment.refundId !== undefined
                ? { refundId: payment.refundId }
                : {}),
            ...(payment.paidAt !== undefined ? { paidAt: payment.paidAt } : {}),
            ...(payment.refundedAt !== undefined
                ? { refundedAt: payment.refundedAt }
                : {}),
            ...(payment.metadata !== undefined ? { metadata: payment.metadata } : {}),
        };
    }

    static allocationToDomain(
        document: IPaymentAllocationDocument
    ): PaymentAllocation {
        return PaymentAllocation.create({
            id: document._id.toString(),
            paymentId: document.paymentId.toString(),
            bookingId: document.bookingId.toString(),
            mechanicId: document.mechanicId.toString(),
            totalAmount: document.totalAmount,
            superAdminShare: document.superAdminShare,
            adminShare: document.adminShare,
            mechanicShare: document.mechanicShare,
            currency: document.currency,
            status: document.status,
            ...(document.allocatedAt !== undefined
                ? { allocatedAt: document.allocatedAt }
                : {}),
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        });
    }

    static allocationToPersistence(allocation: PaymentAllocation) {
        return {
            paymentId: allocation.paymentId,
            bookingId: allocation.bookingId,
            mechanicId: allocation.mechanicId,
            totalAmount: allocation.totalAmount,
            superAdminShare: allocation.superAdminShare,
            adminShare: allocation.adminShare,
            mechanicShare: allocation.mechanicShare,
            currency: allocation.currency,
            status: allocation.status,
            ...(allocation.allocatedAt !== undefined
                ? { allocatedAt: allocation.allocatedAt }
                : {}),
        };
    }
}

