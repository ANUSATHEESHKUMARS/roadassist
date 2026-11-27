export type BookingType = "emergency" | "scheduled";

export type BookingSlot =
    | "morning"
    | "afternoon"
    | "full_day";

export type BookingStatus =
    | "pending"
    | "pending_payment"
    | "accepted"
    | "rejected"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "expired";

export type PaymentStatus =
    | "created"
    | "pending"
    | "paid"
    | "failed"
    | "refund_requested"
    | "refund_pending"
    | "refunded";

export type AllocationStatus =
    | "pending"
    | "allocated"
    | "reversed";
