import { Types } from "mongoose";
import { EmergencyWorkflowMapper } from "../../application/mappers/EmergencyWorkflowMapper.js";
import type {
    IEmergencyEstimateRepository,
    IEmergencyInspectionRepository,
    IEmergencyPaymentRepository,
    IEmergencyRepairRepository,
} from "../../domain/repositories/IEmergencyWorkflowRepositories.js";
import type {
    EmergencyEstimate,
    EmergencyEstimateProps,
    EmergencyEstimateStatus,
    EmergencyInspection,
    EmergencyInspectionProps,
    EmergencyInspectionStatus,
    EmergencyPayment,
    EmergencyPaymentProps,
    EmergencyPaymentStatus,
    EmergencyRepair,
    EmergencyRepairProps,
    EmergencyRepairStatus,
    RepairProgressLog,
} from "../../domain/User/entities/EmergencyWorkflow.js";
import type { ITransactionContext } from "../databases/interface/ITransactionContext.js";
import { EmergencyEstimateModel } from "../databases/models/EmergencyEstimateModel.js";
import { EmergencyInspectionModel } from "../databases/models/EmergencyInspectionModel.js";
import { EmergencyPaymentModel } from "../databases/models/EmergencyPaymentModel.js";
import { EmergencyRepairModel } from "../databases/models/EmergencyRepairModel.js";
import { MongoTransactionContext } from "../databases/MongoTransactionContext.js";

function extractSession(transaction?: ITransactionContext) {
    return transaction instanceof MongoTransactionContext
        ? transaction.session
        : undefined;
}

export class MongoEmergencyInspectionRepository
    implements IEmergencyInspectionRepository
{
    async create(inspection: EmergencyInspection): Promise<EmergencyInspection> {
        const doc = await EmergencyInspectionModel.create({
            emergencyRequestId: new Types.ObjectId(inspection.emergencyRequestId),
            mechanicId: new Types.ObjectId(inspection.mechanicId),
            vehicleId: new Types.ObjectId(inspection.vehicleId),
            status: inspection.status,
            ...(inspection.vehicleConditionSummary !== undefined
                ? { vehicleConditionSummary: inspection.vehicleConditionSummary }
                : {}),
            findings: inspection.findings,
            requiredRepairs: inspection.requiredRepairs,
            ...(inspection.notes !== undefined ? { notes: inspection.notes } : {}),
            ...(inspection.startedAt !== undefined
                ? { startedAt: inspection.startedAt }
                : {}),
            ...(inspection.completedAt !== undefined
                ? { completedAt: inspection.completedAt }
                : {}),
        });
        return EmergencyWorkflowMapper.inspectionToDomain(doc);
    }

    async findByEmergencyRequestId(
        emergencyRequestId: string
    ): Promise<EmergencyInspection | null> {
        if (!Types.ObjectId.isValid(emergencyRequestId)) return null;
        const doc = await EmergencyInspectionModel.findOne({
            emergencyRequestId: new Types.ObjectId(emergencyRequestId),
        }).exec();
        return doc ? EmergencyWorkflowMapper.inspectionToDomain(doc) : null;
    }

    async updateWithStatusGuard(
        emergencyRequestId: string,
        mechanicId: string,
        expectedStatuses: EmergencyInspectionStatus[],
        updates: Partial<EmergencyInspectionProps>
    ): Promise<EmergencyInspection | null> {
        if (
            !Types.ObjectId.isValid(emergencyRequestId) ||
            !Types.ObjectId.isValid(mechanicId)
        ) {
            return null;
        }

        const setFields: Record<string, unknown> = {
            ...(updates.status !== undefined ? { status: updates.status } : {}),
            ...(updates.vehicleConditionSummary !== undefined
                ? { vehicleConditionSummary: updates.vehicleConditionSummary }
                : {}),
            ...(updates.findings !== undefined ? { findings: updates.findings } : {}),
            ...(updates.requiredRepairs !== undefined
                ? { requiredRepairs: updates.requiredRepairs }
                : {}),
            ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
            ...(updates.startedAt !== undefined ? { startedAt: updates.startedAt } : {}),
            ...(updates.completedAt !== undefined
                ? { completedAt: updates.completedAt }
                : {}),
        };

        const doc = await EmergencyInspectionModel.findOneAndUpdate(
            {
                emergencyRequestId: new Types.ObjectId(emergencyRequestId),
                mechanicId: new Types.ObjectId(mechanicId),
                status: { $in: expectedStatuses },
            },
            { $set: setFields },
            { new: true, runValidators: true }
        ).exec();

        return doc ? EmergencyWorkflowMapper.inspectionToDomain(doc) : null;
    }
}

export class MongoEmergencyEstimateRepository
    implements IEmergencyEstimateRepository
{
    async create(
        estimate: EmergencyEstimate,
        transaction?: ITransactionContext
    ): Promise<EmergencyEstimate> {
        const session = extractSession(transaction);
        const payload = {
            emergencyRequestId: new Types.ObjectId(estimate.emergencyRequestId),
            mechanicId: new Types.ObjectId(estimate.mechanicId),
            customerId: new Types.ObjectId(estimate.customerId),
            inspectionId: new Types.ObjectId(estimate.inspectionId),
            revision: estimate.revision,
            inspectionCharge: estimate.inspectionCharge,
            items: estimate.items,
            partsTotal: estimate.partsTotal,
            labourTotal: estimate.labourTotal,
            additionalTotal: estimate.additionalTotal,
            totalAmount: estimate.totalAmount,
            ...(estimate.estimatedCompletionMinutes !== undefined
                ? { estimatedCompletionMinutes: estimate.estimatedCompletionMinutes }
                : {}),
            ...(estimate.notes !== undefined ? { notes: estimate.notes } : {}),
            status: estimate.status,
            ...(estimate.submittedAt !== undefined
                ? { submittedAt: estimate.submittedAt }
                : {}),
        };

        if (session) {
            const [created] = await EmergencyEstimateModel.create([payload], {
                session,
            });
            if (!created) throw new Error("Failed to create emergency estimate");
            return EmergencyWorkflowMapper.estimateToDomain(created);
        }

        const doc = await EmergencyEstimateModel.create(payload);
        return EmergencyWorkflowMapper.estimateToDomain(doc);
    }

    async findById(
        estimateId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyEstimate | null> {
        if (!Types.ObjectId.isValid(estimateId)) return null;
        const session = extractSession(transaction);
        const query = EmergencyEstimateModel.findById(estimateId);
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? EmergencyWorkflowMapper.estimateToDomain(doc) : null;
    }

    async findAllByEmergencyRequestId(
        emergencyRequestId: string
    ): Promise<EmergencyEstimate[]> {
        if (!Types.ObjectId.isValid(emergencyRequestId)) return [];
        const docs = await EmergencyEstimateModel.find({
            emergencyRequestId: new Types.ObjectId(emergencyRequestId),
        })
            .sort({ revision: -1 })
            .exec();
        return docs.map((d) => EmergencyWorkflowMapper.estimateToDomain(d));
    }

    async findLatestByEmergencyRequestId(
        emergencyRequestId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyEstimate | null> {
        if (!Types.ObjectId.isValid(emergencyRequestId)) return null;
        const session = extractSession(transaction);
        const query = EmergencyEstimateModel.findOne({
            emergencyRequestId: new Types.ObjectId(emergencyRequestId),
        }).sort({ revision: -1 });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? EmergencyWorkflowMapper.estimateToDomain(doc) : null;
    }

    async updateStatusWithGuard(
        estimateId: string,
        expectedStatuses: EmergencyEstimateStatus[],
        nextStatus: EmergencyEstimateStatus,
        updates?: Partial<EmergencyEstimateProps>,
        transaction?: ITransactionContext
    ): Promise<EmergencyEstimate | null> {
        if (!Types.ObjectId.isValid(estimateId)) return null;
        const session = extractSession(transaction);
        const setFields: Record<string, unknown> = {
            status: nextStatus,
            ...(updates?.approvedAt !== undefined
                ? { approvedAt: updates.approvedAt }
                : {}),
            ...(updates?.rejectedAt !== undefined
                ? { rejectedAt: updates.rejectedAt }
                : {}),
            ...(updates?.rejectionReason !== undefined
                ? { rejectionReason: updates.rejectionReason }
                : {}),
            ...(updates?.paidAt !== undefined ? { paidAt: updates.paidAt } : {}),
        };

        const doc = await EmergencyEstimateModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(estimateId),
                status: { $in: expectedStatuses },
            },
            { $set: setFields },
            {
                new: true,
                runValidators: true,
                ...(session ? { session } : {}),
            }
        ).exec();

        return doc ? EmergencyWorkflowMapper.estimateToDomain(doc) : null;
    }

    async markRejectedRevisionsSuperseded(
        emergencyRequestId: string,
        transaction?: ITransactionContext
    ): Promise<number> {
        if (!Types.ObjectId.isValid(emergencyRequestId)) return 0;
        const session = extractSession(transaction);
        const result = await EmergencyEstimateModel.updateMany(
            {
                emergencyRequestId: new Types.ObjectId(emergencyRequestId),
                status: "rejected",
            },
            { $set: { status: "revised" } },
            ...(session ? [{ session }] : [])
        ).exec();
        return result.modifiedCount;
    }
}

export class MongoEmergencyPaymentRepository
    implements IEmergencyPaymentRepository
{
    async create(
        payment: EmergencyPayment,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment> {
        const session = extractSession(transaction);
        const payload = {
            emergencyRequestId: new Types.ObjectId(payment.emergencyRequestId),
            estimateId: new Types.ObjectId(payment.estimateId),
            estimateRevision: payment.estimateRevision,
            customerId: new Types.ObjectId(payment.customerId),
            mechanicId: new Types.ObjectId(payment.mechanicId),
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
        };

        if (session) {
            const [created] = await EmergencyPaymentModel.create([payload], {
                session,
            });
            if (!created) throw new Error("Failed to create emergency payment");
            return EmergencyWorkflowMapper.paymentToDomain(created);
        }

        const doc = await EmergencyPaymentModel.create(payload);
        return EmergencyWorkflowMapper.paymentToDomain(doc);
    }

    async findById(
        paymentId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null> {
        if (!Types.ObjectId.isValid(paymentId)) return null;
        const session = extractSession(transaction);
        const query = EmergencyPaymentModel.findById(paymentId);
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? EmergencyWorkflowMapper.paymentToDomain(doc) : null;
    }

    async findLatestByEmergencyRequestId(
        emergencyRequestId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null> {
        if (!Types.ObjectId.isValid(emergencyRequestId)) return null;
        const session = extractSession(transaction);
        const query = EmergencyPaymentModel.findOne({
            emergencyRequestId: new Types.ObjectId(emergencyRequestId),
        }).sort({ createdAt: -1 });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? EmergencyWorkflowMapper.paymentToDomain(doc) : null;
    }

    async findLatestByEstimateId(
        estimateId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null> {
        if (!Types.ObjectId.isValid(estimateId)) return null;
        const session = extractSession(transaction);
        const query = EmergencyPaymentModel.findOne({
            estimateId: new Types.ObjectId(estimateId),
        }).sort({ createdAt: -1 });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? EmergencyWorkflowMapper.paymentToDomain(doc) : null;
    }

    async findByRazorpayOrderId(
        orderId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null> {
        const session = extractSession(transaction);
        const query = EmergencyPaymentModel.findOne({ razorpayOrderId: orderId });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? EmergencyWorkflowMapper.paymentToDomain(doc) : null;
    }

    async findByRazorpayPaymentId(
        razorpayPaymentId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null> {
        const session = extractSession(transaction);
        const query = EmergencyPaymentModel.findOne({ razorpayPaymentId });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? EmergencyWorkflowMapper.paymentToDomain(doc) : null;
    }

    async updateStatusWithGuard(
        paymentId: string,
        expectedStatuses: EmergencyPaymentStatus[],
        nextStatus: EmergencyPaymentStatus,
        updates?: Partial<EmergencyPaymentProps>,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null> {
        if (!Types.ObjectId.isValid(paymentId)) return null;
        const session = extractSession(transaction);
        const setFields: Record<string, unknown> = {
            status: nextStatus,
            ...(updates?.razorpayPaymentId !== undefined
                ? { razorpayPaymentId: updates.razorpayPaymentId }
                : {}),
            ...(updates?.razorpaySignature !== undefined
                ? { razorpaySignature: updates.razorpaySignature }
                : {}),
            ...(updates?.failureReason !== undefined
                ? { failureReason: updates.failureReason }
                : {}),
            ...(updates?.paidAt !== undefined ? { paidAt: updates.paidAt } : {}),
            ...(updates?.refundedAt !== undefined
                ? { refundedAt: updates.refundedAt }
                : {}),
        };

        const doc = await EmergencyPaymentModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(paymentId),
                status: { $in: expectedStatuses },
            },
            { $set: setFields },
            {
                new: true,
                runValidators: true,
                ...(session ? { session } : {}),
            }
        ).exec();

        return doc ? EmergencyWorkflowMapper.paymentToDomain(doc) : null;
    }
}

export class MongoEmergencyRepairRepository implements IEmergencyRepairRepository {
    async create(
        repair: EmergencyRepair,
        transaction?: ITransactionContext
    ): Promise<EmergencyRepair> {
        const session = extractSession(transaction);
        const payload = {
            emergencyRequestId: new Types.ObjectId(repair.emergencyRequestId),
            mechanicId: new Types.ObjectId(repair.mechanicId),
            estimateId: new Types.ObjectId(repair.estimateId),
            status: repair.status,
            progressLogs: repair.progressLogs,
            ...(repair.workPerformed !== undefined
                ? { workPerformed: repair.workPerformed }
                : {}),
            partsUsed: repair.partsUsed,
            ...(repair.startedAt !== undefined
                ? { startedAt: repair.startedAt }
                : {}),
            ...(repair.completedAt !== undefined
                ? { completedAt: repair.completedAt }
                : {}),
        };

        if (session) {
            const [created] = await EmergencyRepairModel.create([payload], {
                session,
            });
            if (!created) throw new Error("Failed to create emergency repair");
            return EmergencyWorkflowMapper.repairToDomain(created);
        }

        const doc = await EmergencyRepairModel.create(payload);
        return EmergencyWorkflowMapper.repairToDomain(doc);
    }

    async findByEmergencyRequestId(
        emergencyRequestId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyRepair | null> {
        if (!Types.ObjectId.isValid(emergencyRequestId)) return null;
        const session = extractSession(transaction);
        const query = EmergencyRepairModel.findOne({
            emergencyRequestId: new Types.ObjectId(emergencyRequestId),
        });
        if (session) query.session(session);
        const doc = await query.exec();
        return doc ? EmergencyWorkflowMapper.repairToDomain(doc) : null;
    }

    async appendProgressLog(
        emergencyRequestId: string,
        mechanicId: string,
        log: RepairProgressLog
    ): Promise<EmergencyRepair | null> {
        if (
            !Types.ObjectId.isValid(emergencyRequestId) ||
            !Types.ObjectId.isValid(mechanicId)
        ) {
            return null;
        }
        const doc = await EmergencyRepairModel.findOneAndUpdate(
            {
                emergencyRequestId: new Types.ObjectId(emergencyRequestId),
                mechanicId: new Types.ObjectId(mechanicId),
                status: "in_progress",
            },
            { $push: { progressLogs: log } },
            { new: true, runValidators: true }
        ).exec();
        return doc ? EmergencyWorkflowMapper.repairToDomain(doc) : null;
    }

    async updateStatusWithGuard(
        emergencyRequestId: string,
        mechanicId: string,
        expectedStatuses: EmergencyRepairStatus[],
        nextStatus: EmergencyRepairStatus,
        updates?: Partial<EmergencyRepairProps>,
        transaction?: ITransactionContext
    ): Promise<EmergencyRepair | null> {
        if (
            !Types.ObjectId.isValid(emergencyRequestId) ||
            !Types.ObjectId.isValid(mechanicId)
        ) {
            return null;
        }
        const session = extractSession(transaction);
        const setFields: Record<string, unknown> = {
            status: nextStatus,
            ...(updates?.workPerformed !== undefined
                ? { workPerformed: updates.workPerformed }
                : {}),
            ...(updates?.partsUsed !== undefined
                ? { partsUsed: updates.partsUsed }
                : {}),
            ...(updates?.startedAt !== undefined
                ? { startedAt: updates.startedAt }
                : {}),
            ...(updates?.completedAt !== undefined
                ? { completedAt: updates.completedAt }
                : {}),
        };

        const doc = await EmergencyRepairModel.findOneAndUpdate(
            {
                emergencyRequestId: new Types.ObjectId(emergencyRequestId),
                mechanicId: new Types.ObjectId(mechanicId),
                status: { $in: expectedStatuses },
            },
            { $set: setFields },
            {
                new: true,
                runValidators: true,
                ...(session ? { session } : {}),
            }
        ).exec();

        return doc ? EmergencyWorkflowMapper.repairToDomain(doc) : null;
    }
}

