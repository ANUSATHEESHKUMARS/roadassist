export type EmergencyIssueCategory =
    | "battery"
    | "flat_tyre"
    | "engine"
    | "brake"
    | "electrical"
    | "fuel"
    | "accident"
    | "overheating"
    | "noise"
    | "other";

export type EmergencyRequestStatus =
    | "pending"
    | "searching"
    | "assigned"
    | "on_the_way"
    | "arrived"
    | "cancelled"
    | "completed";

export interface EmergencyLocation {
    latitude: number,
    longitude: number,
    address?: string,
    source?: "gps" | "map" | "manual",
    pincode?: string
}

export interface EmergencyVehicleOption {
    id: string,
    brand: string,
    model: string,
    registratioNumber: string,
    vehicleType?: string

}

export interface CreateEmergencyRequestPayload {
    vehicleId: string,
    location: EmergencyLocation,
    emergencyIssueCategory: EmergencyIssueCategory,
    issueTitle: string,
    issueDescription: string,
    issueImages: string[];
}

export interface EmergencyRequestResponse {
    id: string,
    status: EmergencyRequestStatus;
}

export interface EmergencyVehicleSummary {
    vehicleId: string;
    brand: string;
    model: string;
    registrationNumber: string;
    vehicleType: string;
    year?: number;
    fuelType?: string;
    color?: string;
    vehicleImage?: string;
}

export interface EmergencyRequestDetail {
    id?: string;
    _id?: string;
    userId: string;
    vehicleId: string;
    location: EmergencyLocation;
    emergencyIssueCategory: EmergencyIssueCategory;
    issueTitle: string;
    issueDescription?: string;
    issueImages: string[];
    status: EmergencyRequestStatus;
    assignedMechanicId: string | null;
    rejectedByMechanicIds: string[];
    acceptedAt?: string;
    travelStartedAt?: string;
    arrivedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    createdAt?: string;
    updatedAt?: string;
    distanceKm?: number;
    vehicleSummary?: EmergencyVehicleSummary;
    discoverySummary?: {
        matchedMechanicsCount: number;
        searchRadiusKm: number | null;
        fallbackUsed: boolean;
    };
}

export interface MechanicLiveLocation {
    requestId: string;
    mechanicId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    heading?: number | null;
    speed?: number | null;
    updatedAt: string;
}

export type EmergencyInspectionStatus = "pending" | "in_progress" | "completed";
export type FindingSeverity = "low" | "medium" | "high";

export interface InspectionFinding {
    component: string;
    issue: string;
    severity: FindingSeverity;
    recommendedAction?: string;
}

export interface EmergencyInspectionDetail {
    id?: string;
    emergencyRequestId: string;
    mechanicId: string;
    vehicleId: string;
    status: EmergencyInspectionStatus;
    vehicleConditionSummary?: string;
    findings: InspectionFinding[];
    requiredRepairs: string[];
    notes?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type EmergencyEstimateStatus =
    | "draft"
    | "submitted"
    | "approved"
    | "rejected"
    | "revised"
    | "paid";

export type EstimateItemCategory = "part" | "labour" | "additional";

export interface EmergencyEstimateItem {
    category: EstimateItemCategory;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
}

export interface EmergencyEstimateDetail {
    id?: string;
    emergencyRequestId: string;
    mechanicId: string;
    customerId: string;
    inspectionId: string;
    revision: number;
    inspectionCharge: number;
    items: Array<{
        category: EstimateItemCategory;
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    partsTotal: number;
    labourTotal: number;
    additionalTotal: number;
    totalAmount: number;
    estimatedCompletionMinutes?: number;
    notes?: string;
    status: EmergencyEstimateStatus;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    paidAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type EmergencyPaymentStatus =
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "refunded";

export interface EmergencyPaymentDetail {
    paymentId: string;
    estimateId: string;
    estimateRevision: number;
    amount: number;
    currency: string;
    status: EmergencyPaymentStatus;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    paidAt?: string;
    failureReason?: string;
}

export interface CreateEmergencyPaymentOrderResponse {
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

export interface VerifyEmergencyPaymentPayload {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface VerifyEmergencyPaymentResponse {
    emergencyRequestId: string;
    estimateId: string;
    estimateStatus: EmergencyEstimateStatus;
    paymentId: string;
    paymentStatus: EmergencyPaymentStatus;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    paidAt?: string;
}

export type EmergencyRepairStatus = "pending" | "in_progress" | "completed";

export interface RepairProgressLog {
    note: string;
    loggedAt: string;
}

export interface RepairPartUsed {
    name: string;
    quantity: number;
    notes?: string;
}

export interface EmergencyRepairDetail {
    id?: string;
    emergencyRequestId: string;
    mechanicId: string;
    estimateId: string;
    status: EmergencyRepairStatus;
    progressLogs: RepairProgressLog[];
    workPerformed?: string;
    partsUsed: RepairPartUsed[];
    startedAt?: string;
    completedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmergencyServiceReport {
    reportReference: string;
    emergencyRequestId: string;
    serviceDate: string;
    completedAt: string;
    issueCategory: EmergencyIssueCategory;
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
    vehicle: EmergencyVehicleSummary;
    inspection: EmergencyInspectionDetail;
    approvedEstimate: EmergencyEstimateDetail;
    estimateHistoryCount: number;
    payment: {
        paymentId: string;
        status: EmergencyPaymentStatus;
        amount: number;
        currency: string;
        razorpayOrderId: string;
        razorpayPaymentId?: string;
        paidAt?: string;
    };
    repair: EmergencyRepairDetail;
}

export interface EmergencyRequestStatusResponse {
    request: EmergencyRequestDetail;
    mechanicDetails: {
        fullName: string;
        email: string;
        phoneNumber: string;
    } | null;
    vehicleDetails?: EmergencyVehicleSummary | null;
    lastKnownLocation?: MechanicLiveLocation | null;
    inspection?: EmergencyInspectionDetail | null;
    latestEstimate?: EmergencyEstimateDetail | null;
    estimateHistory?: EmergencyEstimateDetail[];
    payment?: EmergencyPaymentDetail | null;
    repair?: EmergencyRepairDetail | null;
}

export interface MechanicAvailabilityResponse {
    mechanicId: string;
    isAvailable: boolean;
    latitude: number;
    longitude: number;
    id?: string;
    updatedAt?: string;
}
export interface MechanicAssignedRequestResponse {
    request: EmergencyRequestDetail;
    customerDetails: {
        fullName: string;
        email: string;
        phoneNumber: string;
    } | null;
    vehicleDetails?: EmergencyVehicleSummary | null;
    inspection?: EmergencyInspectionDetail | null;
    latestEstimate?: EmergencyEstimateDetail | null;
    estimateHistory?: EmergencyEstimateDetail[];
    payment?: EmergencyPaymentDetail | null;
    repair?: EmergencyRepairDetail | null;
}

export interface RtcIceConfiguration {
    iceServers: RTCIceServer[];
    hasTurnServer: boolean;
}