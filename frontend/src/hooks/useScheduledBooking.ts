import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "@/api/apiError";
import { scheduledBookingService } from "@/services/booking/scheduledBookingService";
import type {
    BookingDetailsResponse,
    BookingLocation,
    BookingSlot,
    BookingStatusResponse,
    BookingStep,
    CreateBookingReservationResponse,
    CreatePaymentOrderResponse,
    DiscoveredMechanicItem,
    DiscoverMechanicsResponse,
    PaymentPhase,
    ScheduledBookingState,
    VerifyPaymentResponse,
} from "@/types/user/scheduledBooking";
import type { Vehicle } from "@/types/user/vehicle";
import {
    getRazorpayConstructor,
    loadRazorpayScript,
    type RazorpayPaymentFailedResponse,
    type RazorpayPaymentSuccessResponse,
} from "@/utils/loadRazorpay";

const INITIAL_STATE: ScheduledBookingState = {
    step: "vehicle",
    selectedVehicle: null,
    serviceType: "",
    problemDescription: "",
    location: null,
    scheduledDate: "",
    slot: null,
    discoveryResult: null,
    selectedMechanic: null,
    reservation: null,
    paymentOrder: null,
    confirmation: null,
    bookingStatus: null,
    bookingDetails: null,
    paymentPhase: "idle",
};

function computeRemainingSeconds(expiresAt: string | undefined, nowMs: number): number | null {
    if (!expiresAt) return null;
    const expiryMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiryMs)) return null;
    const diff = Math.floor((expiryMs - nowMs) / 1000);
    return diff > 0 ? diff : 0;
}

export interface InitiatePaymentPrefill {
    name?: string;
    email?: string;
}

export function useScheduledBooking() {
    const [state, setState] = useState<ScheduledBookingState>(INITIAL_STATE);
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    const [isDiscovering, setIsDiscovering] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [isRecoveringStatus, setIsRecoveringStatus] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const paymentSettledRef = useRef(false);

    const reservationExpiresAt = state.reservation?.reservationExpiresAt;

    // Tick clock every second while an active pending_payment reservation exists
    useEffect(() => {
        if (!reservationExpiresAt || state.paymentPhase === "confirmed") {
            return;
        }

        const interval = window.setInterval(() => {
            setNowMs(Date.now());
        }, 1000);

        return () => window.clearInterval(interval);
    }, [reservationExpiresAt, state.paymentPhase]);

    const remainingSeconds = useMemo(() => {
        if (!reservationExpiresAt || state.paymentPhase === "confirmed") {
            return null;
        }
        return computeRemainingSeconds(reservationExpiresAt, nowMs);
    }, [reservationExpiresAt, state.paymentPhase, nowMs]);

    const isReservationExpired = useMemo(() => {
        if (state.paymentPhase === "confirmed") return false;
        if (!state.reservation) return false;
        if (state.reservation.status === "expired") return true;
        return remainingSeconds !== null && remainingSeconds <= 0;
    }, [state.reservation, state.paymentPhase, remainingSeconds]);

    const clearError = useCallback(() => setError(null), []);

    const setStep = useCallback((step: BookingStep) => {
        setError(null);
        setState((prev) => ({ ...prev, step }));
    }, []);

    const selectVehicle = useCallback((vehicle: Vehicle) => {
        setError(null);
        setState((prev) => ({
            ...prev,
            selectedVehicle: vehicle,
            discoveryResult: null,
            selectedMechanic: null,
        }));
    }, []);

    const setServiceType = useCallback((serviceType: string) => {
        setError(null);
        setState((prev) => ({
            ...prev,
            serviceType,
            discoveryResult: null,
            selectedMechanic: null,
        }));
    }, []);

    const setProblemDescription = useCallback((problemDescription: string) => {
        setError(null);
        setState((prev) => ({
            ...prev,
            problemDescription,
        }));
    }, []);

    const setLocation = useCallback((location: BookingLocation | null) => {
        setError(null);
        setState((prev) => ({
            ...prev,
            location,
            discoveryResult: null,
            selectedMechanic: null,
        }));
    }, []);

    const setScheduledDate = useCallback((scheduledDate: string) => {
        setError(null);
        setState((prev) => ({
            ...prev,
            scheduledDate,
            discoveryResult: null,
            selectedMechanic: null,
        }));
    }, []);

    const setSlot = useCallback((slot: BookingSlot) => {
        setError(null);
        setState((prev) => ({
            ...prev,
            slot,
            discoveryResult: null,
            selectedMechanic: null,
        }));
    }, []);

    const selectMechanic = useCallback((mechanic: DiscoveredMechanicItem | null) => {
        setError(null);
        setState((prev) => ({ ...prev, selectedMechanic: mechanic }));
    }, []);

    const resetReservation = useCallback(() => {
        paymentSettledRef.current = false;
        setError(null);
        setState((prev) => ({
            ...prev,
            reservation: null,
            paymentOrder: null,
            confirmation: null,
            bookingStatus: null,
            paymentPhase: "idle",
            step: "mechanics",
        }));
    }, []);

    const resetBooking = useCallback(() => {
        paymentSettledRef.current = false;
        setError(null);
        setState(INITIAL_STATE);
    }, []);

    const discoverMechanics = useCallback(async (): Promise<DiscoverMechanicsResponse | null> => {
        const { selectedVehicle, serviceType, location, scheduledDate, slot } = state;

        if (!selectedVehicle) {
            setError("Please select a vehicle.");
            return null;
        }
        if (!serviceType.trim()) {
            setError("Please select a service type.");
            return null;
        }
        if (!location) {
            setError("Please select a service location.");
            return null;
        }
        if (!scheduledDate || !slot) {
            setError("Please select both a booking date and shift.");
            return null;
        }

        try {
            setIsDiscovering(true);
            setError(null);

            const result = await scheduledBookingService.discoverMechanics({
                scheduledDate,
                slot,
                vehicleId: selectedVehicle.id,
                serviceType: serviceType.trim(),
                latitude: location.latitude,
                longitude: location.longitude,
            });

            setState((prev) => ({
                ...prev,
                discoveryResult: result,
                selectedMechanic: null,
                step: "mechanics",
            }));

            return result;
        } catch (err) {
            const message = getApiErrorMessage(err);
            setError(message);
            return null;
        } finally {
            setIsDiscovering(false);
        }
    }, [state]);

    const createReservation = useCallback(
        async (
            mechanicOverride?: DiscoveredMechanicItem
        ): Promise<CreateBookingReservationResponse | null> => {
            const mechanic = mechanicOverride ?? state.selectedMechanic;
            const {
                selectedVehicle,
                serviceType,
                problemDescription,
                location,
                scheduledDate,
                slot,
            } = state;

            if (!mechanic) {
                setError("Please select a mechanic before confirming.");
                return null;
            }
            if (!selectedVehicle || !serviceType.trim() || !location || !scheduledDate || !slot) {
                setError("Incomplete booking details. Please review earlier steps.");
                return null;
            }

            try {
                setIsReserving(true);
                setError(null);
                paymentSettledRef.current = false;

                const trimmedDescription = problemDescription.trim();
                const reservation = await scheduledBookingService.createReservation({
                    mechanicId: mechanic.mechanicId,
                    vehicleId: selectedVehicle.id,
                    serviceType: serviceType.trim(),
                    ...(trimmedDescription
                        ? { problemDescription: trimmedDescription }
                        : {}),
                    serviceAddress: location.address.trim(),
                    scheduledDate,
                    slot,
                    latitude: location.latitude,
                    longitude: location.longitude,
                });

                setNowMs(Date.now());
                setState((prev) => ({
                    ...prev,
                    selectedMechanic: mechanic,
                    reservation,
                    paymentOrder: null,
                    confirmation: null,
                    bookingStatus: null,
                    paymentPhase: "idle",
                    step: "payment",
                }));

                return reservation;
            } catch (err) {
                const message = getApiErrorMessage(err);
                setError(message);
                return null;
            } finally {
                setIsReserving(false);
            }
        },
        [state]
    );

    const recoverBookingStatus = useCallback(
        async (
            bookingIdOverride?: string
        ): Promise<{
            status: BookingStatusResponse;
            details?: BookingDetailsResponse;
        } | null> => {
            const targetBookingId =
                bookingIdOverride ?? state.reservation?.bookingId ?? state.bookingDetails?.bookingId;

            if (!targetBookingId) {
                setError("Booking ID is unavailable for status recovery.");
                return null;
            }

            try {
                setIsRecoveringStatus(true);
                setError(null);

                const status = await scheduledBookingService.getBookingStatus(
                    targetBookingId
                );

                if (status.status === "confirmed") {
                    const details = await scheduledBookingService.getBookingDetails(
                        targetBookingId
                    );
                    paymentSettledRef.current = true;

                    const recoveredConfirmation: VerifyPaymentResponse | null =
                        details.payment && details.allocation
                            ? {
                                  bookingId: details.bookingId,
                                  bookingStatus: details.status,
                                  paymentId: details.payment.paymentId,
                                  paymentStatus: details.payment.status,
                                  razorpayOrderId: details.payment.razorpayOrderId,
                                  razorpayPaymentId:
                                      details.payment.razorpayPaymentId ?? "",
                                  amount: details.payment.amount,
                                  currency: details.payment.currency,
                                  ...(details.confirmedAt !== undefined
                                      ? { confirmedAt: details.confirmedAt }
                                      : {}),
                                  allocation: details.allocation,
                              }
                            : null;

                    setState((prev) => ({
                        ...prev,
                        bookingStatus: status,
                        bookingDetails: details,
                        confirmation: recoveredConfirmation ?? prev.confirmation,
                        paymentPhase: "confirmed",
                        step: "confirmation",
                    }));

                    return { status, details };
                }

                const nextPhase: PaymentPhase =
                    status.status === "expired"
                        ? "failed"
                        : status.payment?.status === "failed"
                          ? "failed"
                          : state.paymentPhase === "pending_recovery"
                            ? "pending_recovery"
                            : state.paymentPhase;

                setState((prev) => ({
                    ...prev,
                    bookingStatus: status,
                    paymentPhase: nextPhase,
                    reservation: prev.reservation
                        ? { ...prev.reservation, status: status.status }
                        : prev.reservation,
                }));

                return { status };
            } catch (err) {
                const message = getApiErrorMessage(err);
                setError(message);
                return null;
            } finally {
                setIsRecoveringStatus(false);
            }
        },
        [state.bookingDetails?.bookingId, state.paymentPhase, state.reservation]
    );

    const verifyPaymentWithBackend = useCallback(
        async (
            bookingId: string,
            response: RazorpayPaymentSuccessResponse
        ): Promise<VerifyPaymentResponse | null> => {
            try {
                setState((prev) => ({ ...prev, paymentPhase: "verifying" }));
                setError(null);

                const verified = await scheduledBookingService.verifyPayment({
                    bookingId,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                });

                paymentSettledRef.current = true;
                setState((prev) => ({
                    ...prev,
                    confirmation: verified,
                    paymentPhase: "confirmed",
                    step: "confirmation",
                    reservation: prev.reservation
                        ? { ...prev.reservation, status: verified.bookingStatus }
                        : prev.reservation,
                }));

                return verified;
            } catch (err) {
                const message = getApiErrorMessage(err);
                setError(message);
                setState((prev) => ({ ...prev, paymentPhase: "pending_recovery" }));
                void recoverBookingStatus(bookingId);
                return null;
            }
        },
        [recoverBookingStatus]
    );

    const initiatePayment = useCallback(
        async (prefill?: InitiatePaymentPrefill): Promise<boolean> => {
            const reservation = state.reservation;
            if (!reservation) {
                setError("No active reservation found. Please select a mechanic first.");
                return false;
            }

            const secondsLeft = computeRemainingSeconds(
                reservation.reservationExpiresAt,
                Date.now()
            );
            if (reservation.status === "expired" || secondsLeft === 0) {
                setError(
                    "Your slot reservation has expired. Please search availability again."
                );
                return false;
            }

            try {
                setError(null);
                paymentSettledRef.current = false;
                setState((prev) => ({ ...prev, paymentPhase: "creating_order" }));

                const order: CreatePaymentOrderResponse =
                    await scheduledBookingService.createPaymentOrder(
                        reservation.bookingId
                    );

                const scriptLoaded = await loadRazorpayScript();
                const RazorpayCtor = getRazorpayConstructor();

                if (!scriptLoaded || !RazorpayCtor) {
                    setState((prev) => ({ ...prev, paymentPhase: "failed" }));
                    setError(
                        "Unable to load Razorpay Checkout. Please check your connection and try again."
                    );
                    return false;
                }

                setState((prev) => ({
                    ...prev,
                    paymentOrder: order,
                    paymentPhase: "checkout_open",
                }));

                const razorpay = new RazorpayCtor({
                    key: order.keyId,
                    amount: order.amountPaise,
                    currency: order.currency,
                    name: "RoadAssist Enterprise",
                    description: `Scheduled Booking (${reservation.serviceType})`,
                    order_id: order.razorpayOrderId,
                    ...(prefill ? { prefill } : {}),
                    notes: {
                        bookingId: reservation.bookingId,
                    },
                    theme: {
                        color: "#ff3b30",
                    },
                    handler: (paymentResponse) => {
                        void verifyPaymentWithBackend(
                            reservation.bookingId,
                            paymentResponse
                        );
                    },
                    modal: {
                        ondismiss: () => {
                            if (paymentSettledRef.current) return;
                            setState((prev) =>
                                prev.paymentPhase === "checkout_open"
                                    ? { ...prev, paymentPhase: "cancelled" }
                                    : prev
                            );
                        },
                    },
                });

                razorpay.on(
                    "payment.failed",
                    (failedResponse: RazorpayPaymentFailedResponse) => {
                        if (paymentSettledRef.current) return;
                        const reason =
                            failedResponse.error?.description ||
                            failedResponse.error?.reason ||
                            "Payment failed at Razorpay. You can retry before your reservation expires.";
                        setError(reason);
                        setState((prev) => ({ ...prev, paymentPhase: "failed" }));
                    }
                );

                razorpay.open();
                return true;
            } catch (err) {
                const message = getApiErrorMessage(err);
                setError(message);
                setState((prev) => ({ ...prev, paymentPhase: "failed" }));
                return false;
            }
        },
        [state.reservation, verifyPaymentWithBackend]
    );

    const loadBookingDetails = useCallback(
        async (bookingId: string): Promise<BookingDetailsResponse | null> => {
            try {
                setIsRecoveringStatus(true);
                setError(null);
                const details = await scheduledBookingService.getBookingDetails(
                    bookingId
                );
                setState((prev) => ({
                    ...prev,
                    bookingDetails: details,
                }));
                return details;
            } catch (err) {
                const message = getApiErrorMessage(err);
                setError(message);
                return null;
            } finally {
                setIsRecoveringStatus(false);
            }
        },
        []
    );

    return {
        state,
        remainingSeconds,
        isReservationExpired,
        isDiscovering,
        isReserving,
        isRecoveringStatus,
        error,
        clearError,
        setStep,
        selectVehicle,
        setServiceType,
        setProblemDescription,
        setLocation,
        setScheduledDate,
        setSlot,
        selectMechanic,
        resetReservation,
        resetBooking,
        discoverMechanics,
        createReservation,
        initiatePayment,
        recoverBookingStatus,
        loadBookingDetails,
    };
}
