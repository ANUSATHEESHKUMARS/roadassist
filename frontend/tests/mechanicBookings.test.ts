import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
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
let API_ROUTES: typeof import("../src/services/apiRoutes.js")["default"];
let scheduledBookingService: typeof import("../src/services/booking/scheduledBookingService.js")["scheduledBookingService"];
let bookingFormat: typeof import("../src/utils/scheduledBookingFormat.js");

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
    const routesMod = await vite.ssrLoadModule("/src/services/apiRoutes.ts");
    const serviceMod = await vite.ssrLoadModule(
        "/src/services/booking/scheduledBookingService.ts"
    );
    const formatMod = await vite.ssrLoadModule(
        "/src/utils/scheduledBookingFormat.ts"
    );

    apiClient = apiClientMod.default;
    API_ROUTES = routesMod.default;
    scheduledBookingService = serviceMod.scheduledBookingService;
    bookingFormat = formatMod as typeof bookingFormat;
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
            status: result.status,
            statusText: "OK",
            headers: {},
            config,
            data: result.data,
        };
    };
    return captured;
}

test("Mechanic booking API routes and MechanicRoutes configuration are aligned", () => {
    assert.equal(API_ROUTES.BOOKING.MECHANIC_BOOKINGS, "/bookings/mechanic");
    assert.equal(
        API_ROUTES.BOOKING.MECHANIC_BOOKING_DETAILS("bk_123"),
        "/bookings/mechanic/bk_123"
    );
    assert.equal(
        API_ROUTES.BOOKING.MECHANIC_START_SERVICE("bk_123"),
        "/bookings/mechanic/bk_123/start"
    );
    assert.equal(
        API_ROUTES.BOOKING.MECHANIC_COMPLETE_SERVICE("bk_123"),
        "/bookings/mechanic/bk_123/complete"
    );

    const routesSource = fs.readFileSync(
        path.join(frontendRoot, "src/routes/MechanicRoutes.tsx"),
        "utf-8"
    );
    assert.match(routesSource, /path:\s*["']\/mechanic\/bookings["']/);
    assert.match(
        routesSource,
        /path:\s*["']\/mechanic\/bookings\/:bookingId["']/
    );

    const sidebarSource = fs.readFileSync(
        path.join(frontendRoot, "src/components/mechanic/MechanicSidebar.tsx"),
        "utf-8"
    );
    assert.match(sidebarSource, /path:\s*["']\/mechanic\/bookings["']/);
});

test("createReservation sends optional problemDescription cleanly", async () => {
    const captured = mockAdapter((config) => ({
        status: 201,
        data: {
            success: true,
            message: "Reserved",
            data: {
                bookingId: "bk_1",
                status: "pending_payment",
                mechanicId: "mech_1",
                vehicleId: "veh_1",
                serviceType: "Engine Repair",
                problemDescription: JSON.parse(String(config.data))
                    .problemDescription,
                serviceAddress: "Sreekaryam",
                scheduledDate: "2026-12-01T00:00:00.000Z",
                slot: "morning",
                bookingAmount: 800,
                currency: "INR",
                reservationExpiresAt: "2026-11-27T15:30:00.000Z",
            },
        },
    }));

    const res = await scheduledBookingService.createReservation({
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        problemDescription: "Loud knocking while cold starting",
        serviceAddress: "Sreekaryam",
        scheduledDate: "2026-12-01",
        slot: "morning",
        latitude: 8.549,
        longitude: 76.915,
    });

    assert.equal(res.problemDescription, "Loud knocking while cold starting");
    const sentBody = JSON.parse(String(captured[0]!.data));
    assert.equal(sentBody.problemDescription, "Loud knocking while cold starting");
});

test("getMechanicBookings forwards filter/search/pagination params and strips empty filters", async () => {
    const captured = mockAdapter(() => ({
        status: 200,
        data: {
            success: true,
            message: "Mechanic bookings retrieved successfully",
            data: {
                bookings: [],
                pagination: {
                    page: 2,
                    limit: 8,
                    total: 10,
                    totalPages: 2,
                    hasNextPage: false,
                    hasPrevPage: true,
                },
                counts: {
                    total: 10,
                    upcoming: 4,
                    today: 2,
                    inProgress: 1,
                    completed: 3,
                    cancelled: 2,
                },
            },
        },
    }));

    const result = await scheduledBookingService.getMechanicBookings({
        page: 2,
        limit: 8,
        filter: "upcoming",
        search: "  Ananya ",
        date: "2026-12-01",
        serviceType: " ",
        sort: "upcoming",
    });

    assert.equal(captured[0]!.url, "/bookings/mechanic");
    assert.deepEqual(captured[0]!.params, {
        page: 2,
        limit: 8,
        filter: "upcoming",
        search: "Ananya",
        date: "2026-12-01",
        sort: "upcoming",
    });
    assert.equal(result.counts.upcoming, 4);
    assert.equal(result.pagination.hasPrevPage, true);
});

test("getMechanicBookingDetails, startMechanicBooking, and completeMechanicBooking execute correct endpoints and propagate errors", async () => {
    const captured = mockAdapter((config) => {
        if (config.url === "/bookings/mechanic/bk_999/start") {
            return {
                status: 409,
                data: {
                    success: false,
                    message: "Cannot start service when booking status is 'completed'",
                },
            };
        }

        if (config.url === "/bookings/mechanic/bk_100/start") {
            return {
                status: 200,
                data: {
                    success: true,
                    message: "Service started successfully",
                    data: {
                        bookingId: "bk_100",
                        status: "in_progress",
                        startedAt: "2026-12-01T04:15:00.000Z",
                    },
                },
            };
        }

        if (config.url === "/bookings/mechanic/bk_100/complete") {
            return {
                status: 200,
                data: {
                    success: true,
                    message: "Service completed successfully",
                    data: {
                        bookingId: "bk_100",
                        status: "completed",
                        completedAt: "2026-12-01T06:00:00.000Z",
                    },
                },
            };
        }

        return {
            status: 200,
            data: {
                success: true,
                message: "Mechanic booking details retrieved successfully",
                data: {
                    bookingId: "bk_100",
                    bookingReference: "BK-000100",
                    userId: "cust_1",
                    mechanicId: "mech_1",
                    vehicleId: "veh_1",
                    bookingType: "scheduled",
                    serviceType: "Brake Inspection",
                    serviceAddress: "Pattom",
                    latitude: 8.52,
                    longitude: 76.94,
                    scheduledDate: "2026-12-01T00:00:00.000Z",
                    slot: "morning",
                    bookingAmount: 800,
                    status: "confirmed",
                },
            },
        };
    });

    const details = await scheduledBookingService.getMechanicBookingDetails("bk_100");
    assert.equal(details.bookingReference, "BK-000100");

    const started = await scheduledBookingService.startMechanicBooking("bk_100");
    assert.equal(started.status, "in_progress");

    const completed = await scheduledBookingService.completeMechanicBooking("bk_100");
    assert.equal(completed.status, "completed");

    assert.equal(captured[0]!.method?.toLowerCase(), "get");
    assert.equal(captured[1]!.method?.toLowerCase(), "patch");
    assert.equal(captured[2]!.method?.toLowerCase(), "patch");

    await assert.rejects(() =>
        scheduledBookingService.startMechanicBooking("bk_999")
    );
});

test("scheduledBookingFormat utilities format timings and Google Maps links properly", () => {
    assert.equal(
        bookingFormat.buildGoogleMapsUrl(8.549, 76.915),
        "https://www.google.com/maps/search/?api=1&query=8.549%2C76.915"
    );
    assert.equal(
        bookingFormat.formatBookingTimingsLabel("afternoon", {
            dateKey: "2026-12-01",
            slot: "afternoon",
            morningStartTime: "09:00",
            morningEndTime: "13:00",
            afternoonStartTime: "14:30",
            afternoonEndTime: "18:30",
            activeSlotStartTime: "14:30",
            activeSlotEndTime: "18:30",
        }),
        "Afternoon Shift (14:30 – 18:30 IST)"
    );
});

