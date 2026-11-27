import { Router } from "express";

import {
    auth,
    bookingController,
    bookingStatusController,
    createPaymentOrderController,
    createReservationController,
    discoverMechanicsController,
    getMyBookingsController,
    razorpayWebhookController,
    verifyPaymentController,
} from "../../di/container.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";

const bookingRouter = Router();

// Razorpay webhook (authenticated via HMAC signature, not user cookie)
bookingRouter.post(
    "/webhook/razorpay",
    asyncHandler(razorpayWebhookController.handle)
);

// Mechanic discovery for scheduled bookings
bookingRouter.get(
    "/discover",
    auth,
    authorizeRoles("user"),
    asyncHandler(discoverMechanicsController.discover)
);

bookingRouter.post(
    "/discover",
    auth,
    authorizeRoles("user"),
    asyncHandler(discoverMechanicsController.discover)
);

// Legacy / direct scheduled booking creation (preserved)
bookingRouter.post(
    "/scheduled",
    auth,
    authorizeRoles("user"),
    asyncHandler(bookingController.createBooking)
);

// Temporary slot reservation
bookingRouter.post(
    "/reservations",
    auth,
    authorizeRoles("user"),
    asyncHandler(createReservationController.createReservation)
);

// Razorpay payment order creation
bookingRouter.post(
    "/payment-order",
    auth,
    authorizeRoles("user"),
    asyncHandler(createPaymentOrderController.createOrder)
);

bookingRouter.post(
    "/:bookingId/payment-order",
    auth,
    authorizeRoles("user"),
    asyncHandler(createPaymentOrderController.createOrder)
);

// Razorpay payment verification & booking confirmation
bookingRouter.post(
    "/verify-payment",
    auth,
    authorizeRoles("user"),
    asyncHandler(verifyPaymentController.verify)
);

bookingRouter.post(
    "/:bookingId/verify-payment",
    auth,
    authorizeRoles("user"),
    asyncHandler(verifyPaymentController.verify)
);

// Customer booking history (must come BEFORE /:bookingId)
bookingRouter.get(
    "/my-bookings",
    auth,
    authorizeRoles("user"),
    asyncHandler(getMyBookingsController.getMyBookings)
);

// Booking status & details
bookingRouter.get(
    "/:bookingId/status",
    auth,
    authorizeRoles("user", "mechanic"),
    asyncHandler(bookingStatusController.getStatus)
);

bookingRouter.get(
    "/:bookingId",
    auth,
    authorizeRoles("user", "mechanic"),
    asyncHandler(bookingStatusController.getDetails)
);

export default bookingRouter;
