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
        adapter?: AxiosAdapter;
    };
};
let mechanicScheduleService: typeof import("../src/services/mechanic/mechanicScheduleService.js")["mechanicScheduleService"];
let calendarUtils: typeof import("../src/utils/mechanicScheduleCalendar.js");

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
        "/src/services/mechanic/mechanicScheduleService.ts"
    );
    const utilsMod = await vite.ssrLoadModule(
        "/src/utils/mechanicScheduleCalendar.ts"
    );

    apiClient = apiClientMod.default;
    mechanicScheduleService = serviceMod.mechanicScheduleService;
    calendarUtils = utilsMod as typeof calendarUtils;
});

test.after(async () => {
    await vite?.close();
});

test("buildMonthCalendarGrid generates Monday-first calendar cells and Asia/Kolkata weekday mapping", () => {
    const cells = calendarUtils.buildMonthCalendarGrid(2026, 11); // December 2026
    assert.equal(cells.length % 7, 0);
    // Dec 1, 2026 is Tuesday -> index 1 in Monday-first grid (index 0 is 2026-11-30)
    assert.equal(cells[0]?.dateKey, "2026-11-30");
    assert.equal(cells[0]?.isCurrentMonth, false);
    assert.equal(cells[1]?.dateKey, "2026-12-01");
    assert.equal(cells[1]?.isCurrentMonth, true);
    assert.equal(calendarUtils.getWeekdayKeyFromDateKey("2026-12-01"), "tuesday");
    assert.equal(calendarUtils.getWeekdayKeyFromDateKey("2026-12-05"), "saturday");
});

test("resolveFrontendDateAvailability applies date overrides over weekly defaults and derives fullDay", () => {
    const baseSchedule = {
        weeklyAvailability: [
            { day: "monday" as const, morning: true, afternoon: true },
            { day: "tuesday" as const, morning: true, afternoon: false },
            { day: "wednesday" as const, morning: false, afternoon: false },
            { day: "thursday" as const, morning: true, afternoon: true },
            { day: "friday" as const, morning: true, afternoon: true },
            { day: "saturday" as const, morning: true, afternoon: true },
            { day: "sunday" as const, morning: false, afternoon: false },
        ],
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        afternoonStartTime: "14:00",
        afternoonEndTime: "18:00",
        isActive: true,
    };

    const overrides = [
        {
            date: "2026-12-05",
            isAvailable: true,
            morning: false,
            afternoon: true,
            afternoonStartTime: "15:00",
            afternoonEndTime: "19:00",
        },
        {
            date: "2026-12-07", // Monday overridden to unavailable
            isAvailable: false,
            morning: false,
            afternoon: false,
        },
    ];

    const overrideDay = calendarUtils.resolveFrontendDateAvailability(
        baseSchedule,
        overrides,
        "2026-12-05"
    );
    assert.equal(overrideDay.source, "date_override");
    assert.equal(overrideDay.morning, false);
    assert.equal(overrideDay.afternoon, true);
    assert.equal(overrideDay.fullDay, false);
    assert.equal(overrideDay.afternoonStartTime, "15:00");

    const unavailDay = calendarUtils.resolveFrontendDateAvailability(
        baseSchedule,
        overrides,
        "2026-12-07"
    );
    assert.equal(unavailDay.source, "date_override");
    assert.equal(unavailDay.isAvailable, false);
    assert.equal(unavailDay.fullDay, false);

    // Fallback to weekly on Dec 8 (Tuesday)
    const weeklyDay = calendarUtils.resolveFrontendDateAvailability(
        baseSchedule,
        overrides,
        "2026-12-08"
    );
    assert.equal(weeklyDay.source, "weekly");
    assert.equal(weeklyDay.morning, true);
    assert.equal(weeklyDay.afternoon, false);
    assert.equal(weeklyDay.fullDay, false);
    assert.equal(weeklyDay.afternoonStartTime, "14:00");
});

test("mechanicScheduleService sends PUT /date-availability, DELETE /date-availability/:date, and GET /booked-dates", async () => {
    const requests: InternalAxiosRequestConfig[] = [];

    apiClient.defaults.adapter = async (config) => {
        requests.push(config);
        if (config.method === "get" && config.url?.includes("/booked-dates")) {
            return {
                data: {
                    success: true,
                    message: "ok",
                    data: [
                        {
                            bookingId: "bk_1",
                            date: "2026-12-05",
                            slot: "afternoon",
                            status: "confirmed",
                        },
                    ],
                },
                status: 200,
                statusText: "OK",
                headers: {},
                config,
            };
        }

        return {
            data: {
                success: true,
                message: "ok",
                data: {
                    mechanicId: "mech_1",
                    weeklyAvailability: [],
                    dateAvailability: [],
                    morningStartTime: "09:00",
                    morningEndTime: "13:00",
                    afternoonStartTime: "14:00",
                    afternoonEndTime: "18:00",
                    isActive: true,
                },
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
        };
    };

    await mechanicScheduleService.upsertDateAvailability({
        date: "2026-12-05",
        isAvailable: true,
        morning: false,
        afternoon: true,
    });
    assert.equal(requests[0]?.method?.toUpperCase(), "PUT");
    assert.equal(requests[0]?.url, "/mechanic/schedule/date-availability");

    await mechanicScheduleService.removeDateAvailability("2026-12-05");
    assert.equal(requests[1]?.method?.toUpperCase(), "DELETE");
    assert.equal(
        requests[1]?.url,
        "/mechanic/schedule/date-availability/2026-12-05"
    );

    const booked = await mechanicScheduleService.getBookedDates("2026-12");
    assert.equal(requests[2]?.method?.toUpperCase(), "GET");
    assert.equal(requests[2]?.url, "/mechanic/schedule/booked-dates");
    assert.deepEqual(requests[2]?.params, { month: "2026-12" });
    assert.equal(booked.length, 1);
    assert.equal(booked[0]?.date, "2026-12-05");
});

test("Schedule update confirmation route, save-handler navigation, and success page actions are properly configured", async () => {
    const routesSource = fs.readFileSync(
        path.join(frontendRoot, "src/routes/MechanicRoutes.tsx"),
        "utf-8"
    );
    assert.match(routesSource, /path:\s*["']\/mechanic\/schedule\/success["']/);
    assert.match(routesSource, /MechanicScheduleSuccessPage/);

    const schedulePageSource = fs.readFileSync(
        path.join(frontendRoot, "src/pages/mechanic/MechanicScedulePage.tsx"),
        "utf-8"
    );
    assert.match(schedulePageSource, /if \(saving\) return;/);
    assert.match(
        schedulePageSource,
        /navigate\("\/mechanic\/schedule\/success",\s*\{/
    );

    const successPageSource = fs
        .readFileSync(
            path.join(
                frontendRoot,
                "src/pages/mechanic/MechanicScheduleSuccessPage.tsx"
            ),
            "utf-8"
        )
        .replace(/\s+/g, " ");
    assert.match(successPageSource, /Schedule Updated Successfully!/);
    assert.match(
        successPageSource,
        /Your working days and service timings have been saved successfully\./
    );
    assert.match(successPageSource, /navigate\("\/mechanic\/schedule"\)/);
    assert.match(successPageSource, /navigate\("\/mechanic\/dashboard"\)/);
    assert.match(successPageSource, /mechanicScheduleService\.getSchedule\(\)/);

    // Confirm updateSchedule resolves with saved data cleanly
    const requests: InternalAxiosRequestConfig[] = [];
    apiClient.defaults.adapter = async (config) => {
        requests.push(config);
        return {
            data: {
                success: true,
                message: "Schedule updated",
                data: {
                    mechanicId: "mech_1",
                    weeklyAvailability: [
                        { day: "monday", morning: true, afternoon: false },
                    ],
                    dateAvailability: [],
                    morningStartTime: "09:00",
                    morningEndTime: "13:00",
                    afternoonStartTime: "14:00",
                    afternoonEndTime: "18:00",
                    isActive: true,
                },
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config,
        };
    };

    const updated = await mechanicScheduleService.updateSchedule({
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        isActive: true,
    });
    assert.equal(requests[0]?.method?.toUpperCase(), "PATCH");
    assert.equal(requests[0]?.url, "/mechanic/schedule/update");
    assert.equal(updated.isActive, true);
});

