
export type BookingSlot =
  | "morning"
  | "afternoon"
  | "full_day";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface BookingProps {
  id?: string;
  userId: string;
  vehicleId: string;
  serviceType: string;
  serviceAddress: string;
  scheduledDate: Date;
  slot: BookingSlot;
  estimatedAmount: number;
  status: BookingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Booking {
  private constructor(
    private readonly props: BookingProps
  ) {}

  static create(props: BookingProps): Booking {
    if (!props.userId.trim()) {
      throw new Error("User ID is required");
    }

    if (!props.vehicleId.trim()) {
      throw new Error("Vehicle ID is required");
    }

    if (!props.serviceType.trim()) {
      throw new Error("Service type is required");
    }

    if (!props.serviceAddress.trim()) {
      throw new Error("Service address is required");
    }

    if (
      !(props.scheduledDate instanceof Date) ||
      Number.isNaN(props.scheduledDate.getTime())
    ) {
      throw new Error("A valid scheduled date is required");
    }

    if (props.scheduledDate.getTime() <= Date.now()) {
      throw new Error("Scheduled date must be in the future");
    }

    const expectedAmount =
      props.slot === "full_day" ? 1300 : 700;

    if (props.estimatedAmount !== expectedAmount) {
      throw new Error("Invalid booking amount");
    }

    return new Booking({
      ...props,
      status: props.status,
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get vehicleId(): string {
    return this.props.vehicleId;
  }

  get serviceType(): string {
    return this.props.serviceType;
  }

  get serviceAddress(): string {
    return this.props.serviceAddress;
  }

  get scheduledDate(): Date {
    return this.props.scheduledDate;
  }

  get slot(): BookingSlot {
    return this.props.slot;
  }

  get estimatedAmount(): number {
    return this.props.estimatedAmount;
  }

  get status(): BookingStatus {
    return this.props.status;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  toObject(): BookingProps {
    return { ...this.props };
  }
}
