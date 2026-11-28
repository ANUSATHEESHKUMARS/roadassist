import {
    EmergencyEstimate,
    EmergencyInspection,
    EmergencyPayment,
    EmergencyRepair,
} from "../../domain/User/entities/EmergencyWorkflow.js";
import type { IEmergencyEstimateDocument } from "../../infrastructure/databases/models/EmergencyEstimateModel.js";
import type { IEmergencyInspectionDocument } from "../../infrastructure/databases/models/EmergencyInspectionModel.js";
import type { IEmergencyPaymentDocument } from "../../infrastructure/databases/models/EmergencyPaymentModel.js";
import type { IEmergencyRepairDocument } from "../../infrastructure/databases/models/EmergencyRepairModel.js";

export class EmergencyWorkflowMapper {
    static inspectionToDomain(
        doc: IEmergencyInspectionDocument
    ): EmergencyInspection {
        return new EmergencyInspection({
            id: doc._id.toString(),
            emergencyRequestId: doc.emergencyRequestId.toString(),
            mechanicId: doc.mechanicId.toString(),
            vehicleId: doc.vehicleId.toString(),
            status: doc.status,
            ...(doc.vehicleConditionSummary !== undefined
                ? { vehicleConditionSummary: doc.vehicleConditionSummary }
                : {}),
            findings: (doc.findings ?? []).map((f) => ({
                component: f.component,
                issue: f.issue,
                severity: f.severity,
                ...(f.recommendedAction !== undefined
                    ? { recommendedAction: f.recommendedAction }
                    : {}),
            })),
            requiredRepairs: [...(doc.requiredRepairs ?? [])],
            ...(doc.notes !== undefined ? { notes: doc.notes } : {}),
            ...(doc.startedAt !== undefined ? { startedAt: doc.startedAt } : {}),
            ...(doc.completedAt !== undefined
                ? { completedAt: doc.completedAt }
                : {}),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static estimateToDomain(doc: IEmergencyEstimateDocument): EmergencyEstimate {
        return new EmergencyEstimate({
            id: doc._id.toString(),
            emergencyRequestId: doc.emergencyRequestId.toString(),
            mechanicId: doc.mechanicId.toString(),
            customerId: doc.customerId.toString(),
            inspectionId: doc.inspectionId.toString(),
            revision: doc.revision,
            inspectionCharge: doc.inspectionCharge,
            items: (doc.items ?? []).map((item) => ({
                category: item.category,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
            })),
            partsTotal: doc.partsTotal,
            labourTotal: doc.labourTotal,
            additionalTotal: doc.additionalTotal,
            totalAmount: doc.totalAmount,
            ...(doc.estimatedCompletionMinutes !== undefined
                ? { estimatedCompletionMinutes: doc.estimatedCompletionMinutes }
                : {}),
            ...(doc.notes !== undefined ? { notes: doc.notes } : {}),
            status: doc.status,
            ...(doc.submittedAt !== undefined
                ? { submittedAt: doc.submittedAt }
                : {}),
            ...(doc.approvedAt !== undefined ? { approvedAt: doc.approvedAt } : {}),
            ...(doc.rejectedAt !== undefined ? { rejectedAt: doc.rejectedAt } : {}),
            ...(doc.rejectionReason !== undefined
                ? { rejectionReason: doc.rejectionReason }
                : {}),
            ...(doc.paidAt !== undefined ? { paidAt: doc.paidAt } : {}),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static paymentToDomain(doc: IEmergencyPaymentDocument): EmergencyPayment {
        return new EmergencyPayment({
            id: doc._id.toString(),
            emergencyRequestId: doc.emergencyRequestId.toString(),
            estimateId: doc.estimateId.toString(),
            estimateRevision: doc.estimateRevision,
            customerId: doc.customerId.toString(),
            mechanicId: doc.mechanicId.toString(),
            amount: doc.amount,
            amountPaise: doc.amountPaise,
            currency: doc.currency,
            razorpayOrderId: doc.razorpayOrderId,
            ...(doc.razorpayPaymentId !== undefined
                ? { razorpayPaymentId: doc.razorpayPaymentId }
                : {}),
            ...(doc.razorpaySignature !== undefined
                ? { razorpaySignature: doc.razorpaySignature }
                : {}),
            status: doc.status,
            idempotencyKey: doc.idempotencyKey,
            ...(doc.failureReason !== undefined
                ? { failureReason: doc.failureReason }
                : {}),
            ...(doc.paidAt !== undefined ? { paidAt: doc.paidAt } : {}),
            ...(doc.refundedAt !== undefined ? { refundedAt: doc.refundedAt } : {}),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static repairToDomain(doc: IEmergencyRepairDocument): EmergencyRepair {
        return new EmergencyRepair({
            id: doc._id.toString(),
            emergencyRequestId: doc.emergencyRequestId.toString(),
            mechanicId: doc.mechanicId.toString(),
            estimateId: doc.estimateId.toString(),
            status: doc.status,
            progressLogs: (doc.progressLogs ?? []).map((l) => ({
                note: l.note,
                loggedAt: l.loggedAt,
            })),
            ...(doc.workPerformed !== undefined
                ? { workPerformed: doc.workPerformed }
                : {}),
            partsUsed: (doc.partsUsed ?? []).map((p) => ({
                name: p.name,
                quantity: p.quantity,
                ...(p.notes !== undefined ? { notes: p.notes } : {}),
            })),
            ...(doc.startedAt !== undefined ? { startedAt: doc.startedAt } : {}),
            ...(doc.completedAt !== undefined
                ? { completedAt: doc.completedAt }
                : {}),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }
}

