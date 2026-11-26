
import {
  BookingType,
  BookingSlot,
  BookingStatus,
} from "../Types/BookingTypes.js";

export interface BookingProps {
  id?: string;
  userId: string;
  vehicleId: string;
  mechanicId: string;
  bookingType: BookingType;
  serviceType: string;
  serviceAddress: string;
  scheduledDate: Date;
  slot: BookingSlot;
  bookingAmount: number;
  estimatedAmount?: number | undefined;
  status: BookingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Booking {
  private constructor(
    private readonly props: BookingProps
  ) { }

  static create(props: BookingProps): Booking {
    return new Booking(props);
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

  get mechanicId(): string {
    return this.props.mechanicId;
  }

  get bookingType(): BookingType {
    return this.props.bookingType;
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
  get bookingAmount(): number {
    return this.props.bookingAmount;
  }
  get estimatedAmount(): number | undefined {
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
