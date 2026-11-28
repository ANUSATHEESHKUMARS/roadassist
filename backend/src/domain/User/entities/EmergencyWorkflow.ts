export type EmergencyInspectionStatus = "pending" | "in_progress" | "completed";
export type FindingSeverity = "low" | "medium" | "high";

export interface InspectionFinding {
    component: string;
    issue: string;
    severity: FindingSeverity;
    recommendedAction?: string;
}

export interface EmergencyInspectionProps {
    id?: string;
    emergencyRequestId: string;
    mechanicId: string;
    vehicleId: string;
    status: EmergencyInspectionStatus;
    vehicleConditionSummary?: string;
    findings: InspectionFinding[];
    requiredRepairs: string[];
    notes?: string;
    startedAt?: Date;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class EmergencyInspection {
    constructor(private readonly props: EmergencyInspectionProps) {}

    get id(): string | undefined {
        return this.props.id;
    }
    get emergencyRequestId(): string {
        return this.props.emergencyRequestId;
    }
    get mechanicId(): string {
        return this.props.mechanicId;
    }
    get vehicleId(): string {
        return this.props.vehicleId;
    }
    get status(): EmergencyInspectionStatus {
        return this.props.status;
    }
    get vehicleConditionSummary(): string | undefined {
        return this.props.vehicleConditionSummary;
    }
    get findings(): InspectionFinding[] {
        return this.props.findings.map((f) => ({ ...f }));
    }
    get requiredRepairs(): string[] {
        return [...this.props.requiredRepairs];
    }
    get notes(): string | undefined {
        return this.props.notes;
    }
    get startedAt(): Date | undefined {
        return this.props.startedAt;
    }
    get completedAt(): Date | undefined {
        return this.props.completedAt;
    }
    get createdAt(): Date | undefined {
        return this.props.createdAt;
    }
    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }

    toObject(): EmergencyInspectionProps {
        return {
            ...this.props,
            findings: this.findings,
            requiredRepairs: this.requiredRepairs,
        };
    }
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
    totalPrice: number;
}

export interface EmergencyEstimateProps {
    id?: string;
    emergencyRequestId: string;
    mechanicId: string;
    customerId: string;
    inspectionId: string;
    revision: number;
    inspectionCharge: number;
    items: EmergencyEstimateItem[];
    partsTotal: number;
    labourTotal: number;
    additionalTotal: number;
    totalAmount: number;
    estimatedCompletionMinutes?: number;
    notes?: string;
    status: EmergencyEstimateStatus;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    paidAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class EmergencyEstimate {
    constructor(private readonly props: EmergencyEstimateProps) {}

    get id(): string | undefined {
        return this.props.id;
    }
    get emergencyRequestId(): string {
        return this.props.emergencyRequestId;
    }
    get mechanicId(): string {
        return this.props.mechanicId;
    }
    get customerId(): string {
        return this.props.customerId;
    }
    get inspectionId(): string {
        return this.props.inspectionId;
    }
    get revision(): number {
        return this.props.revision;
    }
    get inspectionCharge(): number {
        return this.props.inspectionCharge;
    }
    get items(): EmergencyEstimateItem[] {
        return this.props.items.map((item) => ({ ...item }));
    }
    get partsTotal(): number {
        return this.props.partsTotal;
    }
    get labourTotal(): number {
        return this.props.labourTotal;
    }
    get additionalTotal(): number {
        return this.props.additionalTotal;
    }
    get totalAmount(): number {
        return this.props.totalAmount;
    }
    get estimatedCompletionMinutes(): number | undefined {
        return this.props.estimatedCompletionMinutes;
    }
    get notes(): string | undefined {
        return this.props.notes;
    }
    get status(): EmergencyEstimateStatus {
        return this.props.status;
    }
    get submittedAt(): Date | undefined {
        return this.props.submittedAt;
    }
    get approvedAt(): Date | undefined {
        return this.props.approvedAt;
    }
    get rejectedAt(): Date | undefined {
        return this.props.rejectedAt;
    }
    get rejectionReason(): string | undefined {
        return this.props.rejectionReason;
    }
    get paidAt(): Date | undefined {
        return this.props.paidAt;
    }
    get createdAt(): Date | undefined {
        return this.props.createdAt;
    }
    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }

    toObject(): EmergencyEstimateProps {
        return {
            ...this.props,
            items: this.items,
        };
    }
}

export type EmergencyPaymentStatus =
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "refunded";

export interface EmergencyPaymentProps {
    id?: string;
    emergencyRequestId: string;
    estimateId: string;
    estimateRevision: number;
    customerId: string;
    mechanicId: string;
    amount: number;
    amountPaise: number;
    currency: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: EmergencyPaymentStatus;
    idempotencyKey: string;
    failureReason?: string;
    paidAt?: Date;
    refundedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class EmergencyPayment {
    constructor(private readonly props: EmergencyPaymentProps) {}

    get id(): string | undefined {
        return this.props.id;
    }
    get emergencyRequestId(): string {
        return this.props.emergencyRequestId;
    }
    get estimateId(): string {
        return this.props.estimateId;
    }
    get estimateRevision(): number {
        return this.props.estimateRevision;
    }
    get customerId(): string {
        return this.props.customerId;
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
    get status(): EmergencyPaymentStatus {
        return this.props.status;
    }
    get idempotencyKey(): string {
        return this.props.idempotencyKey;
    }
    get failureReason(): string | undefined {
        return this.props.failureReason;
    }
    get paidAt(): Date | undefined {
        return this.props.paidAt;
    }
    get refundedAt(): Date | undefined {
        return this.props.refundedAt;
    }
    get createdAt(): Date | undefined {
        return this.props.createdAt;
    }
    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }

    toObject(): EmergencyPaymentProps {
        return { ...this.props };
    }
}

export type EmergencyRepairStatus = "pending" | "in_progress" | "completed";

export interface RepairProgressLog {
    note: string;
    loggedAt: Date;
}

export interface RepairPartUsed {
    name: string;
    quantity: number;
    notes?: string;
}

export interface EmergencyRepairProps {
    id?: string;
    emergencyRequestId: string;
    mechanicId: string;
    estimateId: string;
    status: EmergencyRepairStatus;
    progressLogs: RepairProgressLog[];
    workPerformed?: string;
    partsUsed: RepairPartUsed[];
    startedAt?: Date;
    completedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class EmergencyRepair {
    constructor(private readonly props: EmergencyRepairProps) {}

    get id(): string | undefined {
        return this.props.id;
    }
    get emergencyRequestId(): string {
        return this.props.emergencyRequestId;
    }
    get mechanicId(): string {
        return this.props.mechanicId;
    }
    get estimateId(): string {
        return this.props.estimateId;
    }
    get status(): EmergencyRepairStatus {
        return this.props.status;
    }
    get progressLogs(): RepairProgressLog[] {
        return this.props.progressLogs.map((l) => ({ ...l }));
    }
    get workPerformed(): string | undefined {
        return this.props.workPerformed;
    }
    get partsUsed(): RepairPartUsed[] {
        return this.props.partsUsed.map((p) => ({ ...p }));
    }
    get startedAt(): Date | undefined {
        return this.props.startedAt;
    }
    get completedAt(): Date | undefined {
        return this.props.completedAt;
    }
    get createdAt(): Date | undefined {
        return this.props.createdAt;
    }
    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }

    toObject(): EmergencyRepairProps {
        return {
            ...this.props,
            progressLogs: this.progressLogs,
            partsUsed: this.partsUsed,
        };
    }
}

