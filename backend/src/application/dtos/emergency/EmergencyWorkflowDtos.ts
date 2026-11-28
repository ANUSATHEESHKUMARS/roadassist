import type {
    EmergencyEstimate,
    EmergencyInspection,
    EmergencyPayment,
    EmergencyRepair,
    EstimateItemCategory,
    FindingSeverity,
    RepairPartUsed,
} from "../../../domain/User/entities/EmergencyWorkflow.js";
import type { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";

export interface CompleteEmergencyInspectionDto {
    vehicleConditionSummary: string;
    findings: Array<{
        component: string;
        issue: string;
        severity?: FindingSeverity;
        recommendedAction?: string;
    }>;
    requiredRepairs: string[];
    notes?: string;
}

export interface SubmitEmergencyEstimateDto {
    inspectionCharge: number;
    items: Array<{
        category: EstimateItemCategory;
        description: string;
        quantity: number;
        unitPrice: number;
    }>;
    estimatedCompletionMinutes?: number;
    notes?: string;
}

export interface RejectEmergencyEstimateDto {
    reason?: string;
}

export interface VerifyEmergencyPaymentDto {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface CreateEmergencyPaymentOrderResponseDto {
    emergencyRequestId: string;
    estimateId: string;
    estimateRevision: number;
    paymentId: string;
    razorpayOrderId: string;
    amount: number;
    amountPaise: number;
    currency: string;
    keyId: string;
}

export interface VerifyEmergencyPaymentResponseDto {
    emergencyRequestId: string;
    estimateId: string;
    estimateStatus: EmergencyEstimate["status"];
    paymentId: string;
    paymentStatus: EmergencyPayment["status"];
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    paidAt?: Date;
}

export interface UpdateRepairProgressDto {
    note: string;
}

export interface CompleteRepairDto {
    workPerformed: string;
    partsUsed?: RepairPartUsed[];
}

export interface EmergencyVehicleInfoDto {
    vehicleId: string;
    brand: string;
    model: string;
    registrationNumber: string;
    vehicleType: string;
    year: number;
    fuelType: string;
    color: string;
    vehicleImage?: string;
}

export interface EmergencyServiceReportDto {
    reportReference: string;
    emergencyRequestId: string;
    serviceDate: Date;
    completedAt: Date;
    issueCategory: EmergencyRequest["emergencyIssueCategory"];
    issueTitle: string;
    issueDescription?: string;
    serviceAddress?: string;
    latitude: number;
    longitude: number;
    customer: {
        userId: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
    mechanic: {
        mechanicId: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        workshopName?: string;
    };
    vehicle: EmergencyVehicleInfoDto;
    inspection: EmergencyInspection;
    approvedEstimate: EmergencyEstimate;
    estimateHistoryCount: number;
    payment: {
        paymentId: string;
        status: EmergencyPayment["status"];
        amount: number;
        currency: string;
        razorpayOrderId: string;
        razorpayPaymentId?: string;
        paidAt?: Date;
    };
    repair: EmergencyRepair;
}

