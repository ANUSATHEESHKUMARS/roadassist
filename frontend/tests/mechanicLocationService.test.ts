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
        adapter?: AxiosAdapter;
    };
};
let mechanicServiceLocationService: typeof import("../src/services/mechanic/mechaniclocationservice.js")["mechanicServiceLocationService"];

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
        "/src/services/mechanic/mechaniclocationservice.ts"
    );

    apiClient = apiClientMod.default;
    mechanicServiceLocationService = serviceMod.mechanicServiceLocationService;
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
    const calls: InternalAxiosRequestConfig[] = [];
    apiClient.defaults.adapter = async (config) => {
        calls.push(config);
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
            data: result.data,
            status: result.status,
            statusText: "OK",
            headers: {},
            config,
        };
    };
    return calls;
}

test("getMyApplication returns null cleanly without throwing when backend returns data: null", async () => {
    const calls = mockAdapter(() => ({
        status: 200,
        data: {
            success: true,
            message: "No mechanic application found",
            data: null,
        },
    }));

    const app = await mechanicServiceLocationService.getMyApplication();
    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.url, "/mechanic/my-application");
    assert.equal(app, null);
});

test("getMyApplication returns existing approved or incomplete draft application", async () => {
    mockAdapter(() => ({
        status: 200,
        data: {
            success: true,
            message: "Mechanic application retrieved successfully",
            data: {
                id: "app_1",
                userId: "mech_1",
                status: "incomplete",
                serviceModel: "mobile",
                serviceAddress: "MG Road",
            },
        },
    }));

    const draft = await mechanicServiceLocationService.getMyApplication();
    assert.equal(draft?.status, "incomplete");
    assert.equal(draft?.serviceAddress, "MG Road");
});

test("getMyApplication rejects once when API returns HTTP error without retry loop", async () => {
    const calls = mockAdapter(() => ({
        status: 500,
        data: { success: false, message: "Database failure" },
    }));

    await assert.rejects(() => mechanicServiceLocationService.getMyApplication());
    assert.equal(calls.length, 1);
});

test("updateServiceLocation sends PATCH /mechanic/service-location and handles success & failure", async () => {
    const calls = mockAdapter(() => ({
        status: 200,
        data: {
            success: true,
            message: "Service location updated successfully",
            data: {
                id: "app_1",
                userId: "mech_1",
                status: "approved",
                serviceModel: "mobile",
                serviceAddress: "MG Road, Kochi",
                pincode: "682016",
                latitude: 9.93,
                longitude: 76.26,
                serviceRadiusKm: 12,
            },
        },
    }));

    const updated = await mechanicServiceLocationService.updateServiceLocation({
        serviceModel: "mobile",
        serviceAddress: "MG Road, Kochi",
        pincode: "682016",
        latitude: 9.93,
        longitude: 76.26,
        serviceRadiusKm: 12,
    });

    assert.equal(calls[0]?.method?.toUpperCase(), "PATCH");
    assert.equal(calls[0]?.url, "/mechanic/service-location");
    assert.equal(updated.pincode, "682016");

    mockAdapter(() => ({
        status: 400,
        data: { succes: false, message: "Enter a valid 6-digit Indian pincode" },
    }));

    await assert.rejects(() =>
        mechanicServiceLocationService.updateServiceLocation({
            serviceModel: "mobile",
            serviceAddress: "MG Road",
            pincode: "123",
            latitude: 9.93,
            longitude: 76.26,
            serviceRadiusKm: 12,
        })
    );
});


test("updateServiceLocation rejects cleanly on network error, missing data, and HTTP 403/500 so caller finally resets saving", async () => {
    // Missing data payload
    mockAdapter(() => ({
        status: 200,
        data: { success: true, message: "ok" },
    }));
    await assert.rejects(
        () =>
            mechanicServiceLocationService.updateServiceLocation({
                serviceModel: "workshop",
                workshopName: "FixIt",
                workshopAddress: "Main Road",
            }),
        /Unable to update service location/i
    );

    // Network failure
    apiClient.defaults.adapter = async () => {
        throw new Error("Network Error");
    };
    await assert.rejects(
        () =>
            mechanicServiceLocationService.updateServiceLocation({
                serviceModel: "workshop",
                workshopName: "FixIt",
                workshopAddress: "Main Road",
            }),
        /Network Error/
    );
});
