import type { ITransactionContext } from "../../infrastructure/databases/interface/ITransactionContext.js";
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
} from "../User/entities/EmergencyWorkflow.js";

export interface IEmergencyInspectionRepository {
    create(inspection: EmergencyInspection): Promise<EmergencyInspection>;

    findByEmergencyRequestId(
        emergencyRequestId: string
    ): Promise<EmergencyInspection | null>;

    updateWithStatusGuard(
        emergencyRequestId: string,
        mechanicId: string,
        expectedStatuses: EmergencyInspectionStatus[],
        updates: Partial<EmergencyInspectionProps>
    ): Promise<EmergencyInspection | null>;
}

export interface IEmergencyEstimateRepository {
    create(
        estimate: EmergencyEstimate,
        transaction?: ITransactionContext
    ): Promise<EmergencyEstimate>;

    findById(
        estimateId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyEstimate | null>;

    findAllByEmergencyRequestId(
        emergencyRequestId: string
    ): Promise<EmergencyEstimate[]>;

    findLatestByEmergencyRequestId(
        emergencyRequestId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyEstimate | null>;

    updateStatusWithGuard(
        estimateId: string,
        expectedStatuses: EmergencyEstimateStatus[],
        nextStatus: EmergencyEstimateStatus,
        updates?: Partial<EmergencyEstimateProps>,
        transaction?: ITransactionContext
    ): Promise<EmergencyEstimate | null>;

    markRejectedRevisionsSuperseded(
        emergencyRequestId: string,
        transaction?: ITransactionContext
    ): Promise<number>;
}

export interface IEmergencyPaymentRepository {
    create(
        payment: EmergencyPayment,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment>;

    findById(
        paymentId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null>;

    findLatestByEmergencyRequestId(
        emergencyRequestId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null>;

    findLatestByEstimateId(
        estimateId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null>;

    findByRazorpayOrderId(
        orderId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null>;

    findByRazorpayPaymentId(
        razorpayPaymentId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null>;

    updateStatusWithGuard(
        paymentId: string,
        expectedStatuses: EmergencyPaymentStatus[],
        nextStatus: EmergencyPaymentStatus,
        updates?: Partial<EmergencyPaymentProps>,
        transaction?: ITransactionContext
    ): Promise<EmergencyPayment | null>;
}

export interface IEmergencyRepairRepository {
    create(
        repair: EmergencyRepair,
        transaction?: ITransactionContext
    ): Promise<EmergencyRepair>;

    findByEmergencyRequestId(
        emergencyRequestId: string,
        transaction?: ITransactionContext
    ): Promise<EmergencyRepair | null>;

    appendProgressLog(
        emergencyRequestId: string,
        mechanicId: string,
        log: RepairProgressLog
    ): Promise<EmergencyRepair | null>;

    updateStatusWithGuard(
        emergencyRequestId: string,
        mechanicId: string,
        expectedStatuses: EmergencyRepairStatus[],
        nextStatus: EmergencyRepairStatus,
        updates?: Partial<EmergencyRepairProps>,
        transaction?: ITransactionContext
    ): Promise<EmergencyRepair | null>;
}

