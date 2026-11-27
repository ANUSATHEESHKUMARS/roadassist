import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, type ViteDevServer } from "vite";
import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");

let vite: ViteDevServer;
let apiClient: {
    defaults: {
        baseURL?: string;
        withCredentials?: boolean;
        adapter?: AxiosAdapter;
    };
};
let scheduledBookingService: typeof import("../src/services/booking/scheduledBookingService.js")["scheduledBookingService"];

test.before(async () => {
    (globalThis as Record<string, unknown>).window = {
        location: { href: "http://localhost:5173" },
    };

    vite = await createServer({
        configFile: false,
        root: frontendRoot,
        resolve: {
            alias: {
                "@": path.resolve(frontendRoot, "src"),
            },
        },
        server: { middlewareMode: true, watch: null, hmr: false },
        appType: "custom",
        optimizeDeps: { noDiscovery: true },
    });

    const apiClientMod = await vite.ssrLoadModule("/src/services/apiClient.ts");
    const serviceMod = await vite.ssrLoadModule(
        "/src/services/booking/scheduledBookingService.ts"
    );

    apiClient = apiClientMod.default;
    scheduledBookingService = serviceMod.scheduledBookingService;
});

test.after(async () => {
    if (vite) {
        await vite.close();
    }
});

function mockAdapter(
    handler: (config: InternalAxiosRequestConfig) => {
        status: number;
        data: unknown;
    }
) {
    const captured: InternalAxiosRequestConfig[] = [];
    apiClient.defaults.adapter = async (config) => {
        captured.push(config);
        const result = handler(config);
        if (result.status >= 400) {
            const err = Object.assign(
                new Error(`Request failed with status ${result.status}`),
                {
                    isAxiosError: true,
                    config,
                    response: {
                        status: result.status,
                        statusText: "Error",
                        headers: {},
                        config,
                        data: result.data,
                    },
                }
            );
            throw err;
        }
        return {
            data: result.data,
            status: result.status,
            statusText: "OK",
            headers: {},
            config,
        };
    };
    return captured;
}

test("apiClient.baseURL + API_ROUTES resolves to /api/bookings/... without duplicate /api", () => {
    assert.equal(apiClient.defaults.baseURL, "http://localhost:5000/api");
    assert.equal(apiClient.defaults.withCredentials, true);
});

test("discoverMechanics sends POST /bookings/discover with exact payload and unwraps response.data.data", async () => {
    const calls = mockAdapter(() => ({
        status: 200,
        data: {
            success: true,
            message: "Available mechanics retrieved successfully",
            data: {
                scheduledDate: "2026-12-01T00:00:00.000Z",
                slot: "morning",
                bookingAmount: 800,
                currency: "INR",
                mechanics: [
                    {
                        mechanicId: "mech_1",
                        fullName: "Test Mechanic",
                        distanceKm: 3.5,
                        serviceRadiusKm: 15,
                        morningStartTime: "09:00",
                        morningEndTime: "13:00",
                        afternoonStartTime: "14:00",
                        afternoonEndTime: "18:00",
                    },
                ],
            },
        },
    }));

    const payload = {
        scheduledDate: "2026-12-01",
        slot: "morning" as const,
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        latitude: 9.9312,
        longitude: 76.2673,
    };

    const result = await scheduledBookingService.discoverMechanics(payload);
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.method?.toUpperCase(), "POST");
    assert.equal(calls[0]?.url, "/bookings/discover");
    assert.deepEqual(JSON.parse(String(calls[0]?.data)), payload);
    assert.equal(result.bookingAmount, 800);
    assert.equal(result.mechanics.length, 1);
});

test("createReservation sends POST /bookings/reservations and returns reservation", async () => {
    const calls = mockAdapter(() => ({
        status: 201,
        data: {
            success: true,
            message: "Booking slot reserved successfully",
            data: {
                bookingId: "bk_123",
                status: "pending_payment",
                mechanicId: "mech_1",
                vehicleId: "veh_1",
                serviceType: "Engine Repair",
                serviceAddress: "MG Road",
                scheduledDate: "2026-12-01T00:00:00.000Z",
                slot: "morning",
                bookingAmount: 800,
                currency: "INR",
                reservationExpiresAt: "2026-12-01T00:10:00.000Z",
            },
        },
    }));

    const payload = {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "MG Road",
        scheduledDate: "2026-12-01",
        slot: "morning" as const,
        latitude: 9.9312,
        longitude: 76.2673,
    };

    const res = await scheduledBookingService.createReservation(payload);
    assert.equal(calls[0]?.method?.toUpperCase(), "POST");
    assert.equal(calls[0]?.url, "/bookings/reservations");
    assert.equal(res.bookingId, "bk_123");
    assert.equal(res.status, "pending_payment");
});

test("createPaymentOrder sends empty POST to /bookings/:bookingId/payment-order", async () => {
    const calls = mockAdapter(() => ({
        status: 201,
        data: {
            success: true,
            message: "Razorpay payment order created successfully",
            data: {
                bookingId: "bk_123",
                paymentId: "pay_123",
                razorpayOrderId: "order_test_1",
                amount: 800,
                amountPaise: 80000,
                currency: "INR",
                keyId: "rzp_test_public",
            },
        },
    }));

    const order = await scheduledBookingService.createPaymentOrder("bk_123");
    assert.equal(calls[0]?.method?.toUpperCase(), "POST");
    assert.equal(calls[0]?.url, "/bookings/bk_123/payment-order");
    assert.equal(calls[0]?.data, undefined);
    assert.equal(order.razorpayOrderId, "order_test_1");
    assert.equal(order.amountPaise, 80000);
});

test("verifyPayment puts bookingId in URL and sends ONLY Razorpay verification fields in body", async () => {
    const calls = mockAdapter(() => ({
        status: 200,
        data: {
            success: true,
            message: "Payment verified and booking confirmed",
            data: {
                bookingId: "bk_123",
                bookingStatus: "confirmed",
                paymentId: "pay_123",
                paymentStatus: "paid",
                razorpayOrderId: "order_1",
                razorpayPaymentId: "pay_rzp_1",
                amount: 800,
                currency: "INR",
                allocation: {
                    id: "alloc_1",
                    totalAmount: 800,
                    superAdminShare: 60,
                    adminShare: 40,
                    mechanicShare: 700,
                    currency: "INR",
                    status: "allocated",
                },
            },
        },
    }));

    const verified = await scheduledBookingService.verifyPayment({
        bookingId: "bk_123",
        razorpayOrderId: "order_1",
        razorpayPaymentId: "pay_rzp_1",
        razorpaySignature: "sig_1",
    });

    assert.equal(calls[0]?.method?.toUpperCase(), "POST");
    assert.equal(calls[0]?.url, "/bookings/bk_123/verify-payment");
    assert.deepEqual(JSON.parse(String(calls[0]?.data)), {
        razorpayOrderId: "order_1",
        razorpayPaymentId: "pay_rzp_1",
        razorpaySignature: "sig_1",
    });
    assert.equal(verified.bookingStatus, "confirmed");
});

test("getBookingStatus and getBookingDetails hit expected GET endpoints", async () => {
    const calls = mockAdapter((config) => {
        if (config.url?.endsWith("/status")) {
            return {
                status: 200,
                data: {
                    success: true,
                    message: "Booking status retrieved successfully",
                    data: {
                        bookingId: "bk_123",
                        status: "confirmed",
                        scheduledDate: "2026-12-01T00:00:00.000Z",
                        slot: "morning",
                        bookingAmount: 800,
                    },
                },
            };
        }
        return {
            status: 200,
            data: {
                success: true,
                message: "Booking details retrieved successfully",
                data: {
                    bookingId: "bk_123",
                    userId: "user_1",
                    mechanicId: "mech_1",
                    vehicleId: "veh_1",
                    bookingType: "scheduled",
                    serviceType: "Engine Repair",
                    serviceAddress: "MG Road",
                    scheduledDate: "2026-12-01T00:00:00.000Z",
                    slot: "morning",
                    bookingAmount: 800,
                    status: "confirmed",
                    vehicle: {
                        vehicleId: "veh_1",
                        brand: "Honda",
                        model: "City",
                        registrationNumber: "KL01AB1234",
                        vehicleType: "car",
                    },
                    mechanic: {
                        mechanicId: "mech_1",
                        fullName: "Mechanic One",
                    },
                },
            },
        };
    });

    const statusRes = await scheduledBookingService.getBookingStatus("bk_123");
    const detailsRes = await scheduledBookingService.getBookingDetails("bk_123");

    assert.equal(calls[0]?.method?.toUpperCase(), "GET");
    assert.equal(calls[0]?.url, "/bookings/bk_123/status");
    assert.equal(statusRes.status, "confirmed");

    assert.equal(calls[1]?.method?.toUpperCase(), "GET");
    assert.equal(calls[1]?.url, "/bookings/bk_123");
    assert.equal(detailsRes.vehicle?.brand, "Honda");
    assert.equal(detailsRes.mechanic?.fullName, "Mechanic One");
});

test("getMyBookings handles query params and empty booking history", async () => {
    const calls = mockAdapter(() => ({
        status: 200,
        data: {
            success: true,
            message: "Customer bookings retrieved successfully",
            data: {
                bookings: [],
                pagination: {
                    page: 1,
                    limit: 8,
                    total: 0,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
                counts: {
                    all: 0,
                    upcoming: 0,
                    completed: 0,
                    cancelled: 0,
                },
            },
        },
    }));

    const res = await scheduledBookingService.getMyBookings({
        page: 1,
        limit: 8,
        category: "upcoming",
    });

    assert.equal(calls[0]?.method?.toUpperCase(), "GET");
    assert.equal(calls[0]?.url, "/bookings/my-bookings");
    assert.deepEqual(calls[0]?.params, {
        page: 1,
        limit: 8,
        category: "upcoming",
    });
    assert.equal(res.bookings.length, 0);
    assert.equal(res.pagination.total, 0);
});

test("rejects incorrect response structures, invalid booking IDs, HTTP errors, auth errors, and payment verification errors", async () => {
    await assert.rejects(
        () => scheduledBookingService.getBookingDetails("   "),
        /valid booking ID/i
    );
    await assert.rejects(
        () => scheduledBookingService.createPaymentOrder(""),
        /valid booking ID/i
    );

    mockAdapter(() => ({
        status: 200,
        data: { success: true, message: "ok" },
    }));
    await assert.rejects(
        () => scheduledBookingService.getBookingStatus("bk_1"),
        /Missing response data/i
    );

    mockAdapter(() => ({
        status: 200,
        data: { success: false, message: "Malformed", data: null },
    }));
    await assert.rejects(
        () => scheduledBookingService.getMyBookings(),
        /Malformed/i
    );

    mockAdapter(() => ({
        status: 401,
        data: {
            succes: false,
            message: "Authentication required",
            code: "AUTHENTICATION_REQUIRED",
        },
    }));
    await assert.rejects(() => scheduledBookingService.getMyBookings());

    mockAdapter(() => ({
        status: 400,
        data: {
            succes: false,
            message: "Invalid payment signature",
            code: "INVALID_PAYMENT_SIGNATURE",
        },
    }));
    await assert.rejects(() =>
        scheduledBookingService.verifyPayment({
            bookingId: "bk_1",
            razorpayOrderId: "order_1",
            razorpayPaymentId: "pay_1",
            razorpaySignature: "bad_sig",
        })
    );
});

