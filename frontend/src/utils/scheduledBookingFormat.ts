import type {
    BookingScheduleTimings,
    BookingSlot,
    BookingStatus,
    PaymentStatus,
} from "@/types/user/scheduledBooking";

export const DEFAULT_SLOT_LABELS: Record<BookingSlot, string> = {
    morning: "Morning (09:00 – 13:00 IST)",
    afternoon: "Afternoon (14:00 – 18:00 IST)",
    full_day: "Full Day (09:00 – 18:00 IST)",
};

export const SHORT_SLOT_LABELS: Record<BookingSlot, string> = {
    morning: "Morning Shift",
    afternoon: "Afternoon Shift",
    full_day: "Full Day",
};

export const BOOKING_STATUS_STYLES: Record<
    BookingStatus,
    { label: string; badgeClass: string }
> = {
    pending_payment: {
        label: "Pending Payment",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    pending: {
        label: "Pending",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    accepted: {
        label: "Accepted",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    confirmed: {
        label: "Confirmed",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    in_progress: {
        label: "In Progress",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    completed: {
        label: "Completed",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    cancelled: {
        label: "Cancelled",
        badgeClass: "bg-muted text-muted-foreground border-border",
    },
    rejected: {
        label: "Rejected",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    },
    expired: {
        label: "Expired",
        badgeClass: "bg-muted text-muted-foreground border-border",
    },
};

export const PAYMENT_STATUS_STYLES: Record<
    PaymentStatus,
    { label: string; badgeClass: string }
> = {
    created: {
        label: "Order Created",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    pending: {
        label: "Payment Pending",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    paid: {
        label: "Verified & Paid",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    failed: {
        label: "Payment Failed",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    },
    refund_requested: {
        label: "Refund Requested",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    refund_pending: {
        label: "Refund Pending",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    refunded: {
        label: "Refunded",
        badgeClass: "bg-muted text-muted-foreground border-border",
    },
};

export function formatIndiaBookingDate(iso?: string): string {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export function formatIndiaBookingDateTime(iso?: string): string {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export function formatBookingTimingsLabel(
    slot: BookingSlot,
    timings?: BookingScheduleTimings
): string {
    if (timings) {
        return `${SHORT_SLOT_LABELS[slot]} (${timings.activeSlotStartTime} – ${timings.activeSlotEndTime} IST)`;
    }
    return DEFAULT_SLOT_LABELS[slot] ?? slot;
}

export function buildGoogleMapsUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${latitude},${longitude}`
    )}`;
}

