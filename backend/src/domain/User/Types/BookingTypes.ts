export type BookingType = "emergency" | "scheduled";

export type BookingSlot =
    | "morning"
    | "afternoon"
    | "full_day";

export type BookingStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled";