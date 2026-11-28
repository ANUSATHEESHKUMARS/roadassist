import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
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
        adapter?: AxiosAdapter;
    };
};
let API_ROUTES: typeof import("../src/services/apiRoutes.js")["default"];
let emergencyRequestService: typeof import("../src/services/EmergencyRequestService.js")["emergencyRequestService"];
let mechanicEmergencyService: typeof import("../src/services/mechanic/mechanicEmergencyService.js")["mechanicEmergencyService"];
let geoUtils: typeof import("../src/utils/geoDistance.js");

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
    const custMod = await vite.ssrLoadModule(
        "/src/services/EmergencyRequestService.ts"
    );
    const mechMod = await vite.ssrLoadModule(
        "/src/services/mechanic/mechanicEmergencyService.ts"
    );
    const geoMod = await vite.ssrLoadModule("/src/utils/geoDistance.ts");

    apiClient = apiClientMod.default;
    API_ROUTES = routesMod.default;
    emergencyRequestService = custMod.emergencyRequestService;
    mechanicEmergencyService = mechMod.mechanicEmergencyService;
    geoUtils = geoMod as typeof import("../src/utils/geoDistance.js");
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
            throw Object.assign(new Error(`HTTP ${result.status}`), {
                isAxiosError: true,
                config,
                response: {
                    status: result.status,
                    statusText: "Error",
                    headers: {},
                    config,
                    data: result.data,
                },
            });
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

test("API_ROUTES exposes all emergency workflow, WebRTC config, payment & invoice routes", () => {
    assert.equal(
        API_ROUTES.EMERGENCY_REQUEST.RTC_CONFIG,
        "/emergency-requests/rtc-config"
    );
    assert.equal(
        API_ROUTES.EMERGENCY_REQUEST.CANCEL("req1"),
        "/emergency-requests/req1/cancel"
    );
    assert.equal(
        API_ROUTES.EMERGENCY_REQUEST.APPROVE_ESTIMATE("req1", "est2"),
        "/emergency-requests/req1/estimates/est2/approve"
    );
    assert.equal(
        API_ROUTES.EMERGENCY_REQUEST.CREATE_PAYMENT_ORDER("req1"),
        "/emergency-requests/req1/payment-order"
    );
    assert.equal(
        API_ROUTES.MECHANIC.SUBMIT_ESTIMATE("req1"),
        "/mechanic/emergency-requests/req1/estimates"
    );
    assert.equal(
        API_ROUTES.MECHANIC.COMPLETE_REPAIR("req1"),
        "/mechanic/emergency-requests/req1/repair/complete"
    );
});

test("emergencyRequestService workflow methods call correct endpoints & serialize payloads", async () => {
    const requests = mockAdapter((cfg) => ({
        status: 200,
        data: {
            success: true,
            message: "ok",
            data:
                cfg.url?.includes("rtc-config")
                    ? { iceServers: [{ urls: "stun:stun.l.google.com:19302" }], hasTurnServer: false }
                    : { id: "res_1", status: "ok" },
        },
    }));

    const rtc = await emergencyRequestService.getRtcIceConfiguration();
    assert.equal(rtc.hasTurnServer, false);

    await emergencyRequestService.cancelRequest("req_99", "Mechanic delayed");
    await emergencyRequestService.approveEstimate("req_99", "est_1");
    await emergencyRequestService.rejectEstimate("req_99", "est_1", "Too costly");
    await emergencyRequestService.createPaymentOrder("req_99");
    await emergencyRequestService.verifyPayment("req_99", {
        razorpayOrderId: "order_1",
        razorpayPaymentId: "pay_1",
        razorpaySignature: "sig_1",
    });
    await emergencyRequestService.getServiceReport("req_99");

    assert.equal(requests.length, 7);
    assert.equal(requests[1]?.url, "/emergency-requests/req_99/cancel");
    assert.deepEqual(JSON.parse(String(requests[1]?.data)), {
        reason: "Mechanic delayed",
    });
    assert.equal(
        requests[2]?.url,
        "/emergency-requests/req_99/estimates/est_1/approve"
    );
    assert.equal(
        requests[3]?.url,
        "/emergency-requests/req_99/estimates/est_1/reject"
    );
    assert.equal(requests[4]?.url, "/emergency-requests/req_99/payment-order");
    assert.equal(requests[5]?.url, "/emergency-requests/req_99/verify-payment");
    assert.equal(requests[6]?.url, "/emergency-requests/req_99/service-report");
});

test("mechanicEmergencyService inspection, estimate, repair & report endpoints work accurately", async () => {
    const requests = mockAdapter(() => ({
        status: 200,
        data: { success: true, message: "ok", data: { ok: true } },
    }));

    await mechanicEmergencyService.startInspection("req_1");
    await mechanicEmergencyService.completeInspection("req_1", {
        vehicleConditionSummary: "Brake line leaking",
        findings: [
            {
                component: "Front caliper",
                issue: "Fluid leak",
                severity: "high",
            },
        ],
        requiredRepairs: ["Replace brake hose"],
    });
    await mechanicEmergencyService.submitEstimate("req_1", {
        inspectionCharge: 200,
        items: [
            {
                category: "part",
                description: "Brake hose",
                quantity: 1,
                unitPrice: 450,
            },
        ],
    });
    await mechanicEmergencyService.startRepair("req_1");
    await mechanicEmergencyService.logRepairProgress("req_1", "Bled brake lines");
    await mechanicEmergencyService.completeRepair("req_1", {
        workPerformed: "Replaced front brake hose and tested stopping pressure",
        partsUsed: [{ name: "Brake hose", quantity: 1 }],
    });
    await mechanicEmergencyService.getServiceReport("req_1");

    assert.deepEqual(
        requests.map((r) => r.url),
        [
            "/mechanic/emergency-requests/req_1/inspection/start",
            "/mechanic/emergency-requests/req_1/inspection/complete",
            "/mechanic/emergency-requests/req_1/estimates",
            "/mechanic/emergency-requests/req_1/repair/start",
            "/mechanic/emergency-requests/req_1/repair/progress",
            "/mechanic/emergency-requests/req_1/repair/complete",
            "/mechanic/emergency-requests/req_1/service-report",
        ]
    );
});

test("geoDistance utilities calculate accurate Haversine distance and travel ETA", () => {
    const km = geoUtils.calculateGeoDistanceKm(8.5568, 76.8816, 8.51, 76.925);
    assert.ok(km > 6 && km < 8);
    const eta = geoUtils.estimateTravelEtaMinutes(km);
    assert.ok(eta !== null && eta >= 10 && eta <= 30);
    assert.equal(geoUtils.estimateTravelEtaMinutes(0.1), 1);
});

test("Architecture & socket invariants hold across layouts and status pages", async () => {
    const [
        userLayoutSrc,
        mechanicLayoutSrc,
        mechanicRequestsPageSrc,
        customerStatusPageSrc,
    ] = await Promise.all([
        fs.readFile(
            path.join(frontendRoot, "src/components/layout/user/UserLayout.tsx"),
            "utf8"
        ),
        fs.readFile(
            path.join(frontendRoot, "src/components/mechanic/MechanicLayout.tsx"),
            "utf8"
        ),
        fs.readFile(
            path.join(
                frontendRoot,
                "src/pages/mechanic/MechanicServiceRequestsPage.tsx"
            ),
            "utf8"
        ),
        fs.readFile(
            path.join(
                frontendRoot,
                "src/pages/user/EmergencyRequestStatusPage.tsx"
            ),
            "utf8"
        ),
    ]);

    assert.match(userLayoutSrc, /EmergencyVideoCallProvider/);
    assert.match(mechanicLayoutSrc, /EmergencyVideoCallProvider/);

    // Shared layout socket must NOT be disconnected when leaving MechanicServiceRequestsPage
    assert.doesNotMatch(mechanicRequestsPageSrc, /socket\.disconnect\(/);
    assert.match(mechanicRequestsPageSrc, /emergency_request_taken/);

    // Customer emergency status page uses real-time Socket.IO events without 10s setInterval polling
    assert.doesNotMatch(customerStatusPageSrc, /setInterval\(/);
    assert.match(customerStatusPageSrc, /emergency_status_updated/);
    assert.match(customerStatusPageSrc, /mechanic_location_updated/);
});
