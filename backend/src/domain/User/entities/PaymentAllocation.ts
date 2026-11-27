import { AllocationStatus } from "../Types/BookingTypes.js";

export interface PaymentAllocationProps {
    id?: string;
    paymentId: string;
    bookingId: string;
    mechanicId: string;
    totalAmount: number;
    superAdminShare: number;
    adminShare: number;
    mechanicShare: number;
    currency: string;
    status: AllocationStatus;
    allocatedAt?: Date | undefined;
    createdAt?: Date;
    updatedAt?: Date;
}

export class PaymentAllocation {
    private constructor(private readonly props: PaymentAllocationProps) {}

    static create(props: PaymentAllocationProps): PaymentAllocation {
        return new PaymentAllocation(props);
    }

    get id(): string | undefined {
        return this.props.id;
    }

    get paymentId(): string {
        return this.props.paymentId;
    }

    get bookingId(): string {
        return this.props.bookingId;
    }

    get mechanicId(): string {
        return this.props.mechanicId;
    }

    get totalAmount(): number {
        return this.props.totalAmount;
    }

    get superAdminShare(): number {
        return this.props.superAdminShare;
    }

    get adminShare(): number {
        return this.props.adminShare;
    }

    get mechanicShare(): number {
        return this.props.mechanicShare;
    }

    get currency(): string {
        return this.props.currency;
    }

    get status(): AllocationStatus {
        return this.props.status;
    }

    get allocatedAt(): Date | undefined {
        return this.props.allocatedAt;
    }

    get createdAt(): Date | undefined {
        return this.props.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }

    toObject(): PaymentAllocationProps {
        return { ...this.props };
    }
}

