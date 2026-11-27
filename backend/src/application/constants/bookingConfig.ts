export const FIXED_BOOKING_AMOUNT_INR = 800;
export const FIXED_SUPER_ADMIN_SHARE_INR = 60;
export const FIXED_ADMIN_SHARE_INR = 40;
export const FIXED_MECHANIC_SHARE_INR = 700;

export function getBookingAmountInr(): number {
    const raw = Number(process.env.BOOKING_AMOUNT);
    if (!Number.isFinite(raw) || raw < FIXED_BOOKING_AMOUNT_INR) {
        return FIXED_BOOKING_AMOUNT_INR;
    }
    return raw;
}

export function getBookingCurrency(): string {
    return (process.env.CURRENCY || "INR").toUpperCase();
}

export function getReservationExpiryMinutes(): number {
    const raw = Number(process.env.BOOKING_RESERVATION_EXPIRY_MINUTES);
    if (!Number.isFinite(raw) || raw <= 0) {
        return 10;
    }
    return raw;
}

export function getPaymentAllocationBreakdown(totalAmount: number = FIXED_BOOKING_AMOUNT_INR) {
    return {
        totalAmount,
        superAdminShare: FIXED_SUPER_ADMIN_SHARE_INR,
        adminShare: FIXED_ADMIN_SHARE_INR,
        mechanicShare: totalAmount - FIXED_SUPER_ADMIN_SHARE_INR - FIXED_ADMIN_SHARE_INR,
    };
}

