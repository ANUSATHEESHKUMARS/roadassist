import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, type ViteDevServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");

let vite: ViteDevServer;
let getApplicationStatusInfo: typeof import("../src/utils/mechanicApplicationStatus.js")["getApplicationStatusInfo"];

test.before(async () => {
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

    const mod = await vite.ssrLoadModule(
        "/src/utils/mechanicApplicationStatus.ts"
    );
    getApplicationStatusInfo = mod.getApplicationStatusInfo;
});

test.after(async () => {
    await vite?.close();
});

// ─── "incomplete" status ──────────────────────────────────────────────────────

test("incomplete status: blocks editing and suggests onboarding", () => {
    const info = getApplicationStatusInfo("incomplete");

    assert.equal(info.label, "Incomplete");
    assert.equal(info.variant, "warning");
    assert.equal(info.canEditServiceLocation, false);
    assert.equal(info.showOnboardingLink, true);
    assert.ok(info.message.toLowerCase().includes("incomplete"));
});

// ─── "pending" status ─────────────────────────────────────────────────────────

test("pending status: blocks editing, no onboarding link", () => {
    const info = getApplicationStatusInfo("pending");

    assert.equal(info.label, "Pending Review");
    assert.equal(info.variant, "info");
    assert.equal(info.canEditServiceLocation, false);
    assert.equal(info.showOnboardingLink, false);
    assert.ok(info.message.toLowerCase().includes("waiting"));
});

// ─── "under_review" status ────────────────────────────────────────────────────

test("under_review status: blocks editing, no onboarding link", () => {
    const info = getApplicationStatusInfo("under_review");

    assert.equal(info.label, "Under Review");
    assert.equal(info.variant, "info");
    assert.equal(info.canEditServiceLocation, false);
    assert.equal(info.showOnboardingLink, false);
    assert.ok(info.message.toLowerCase().includes("reviewed"));
});

// ─── "changes_requested" status ───────────────────────────────────────────────

test("changes_requested status: blocks editing, links to onboarding", () => {
    const info = getApplicationStatusInfo("changes_requested");

    assert.equal(info.label, "Changes Requested");
    assert.equal(info.variant, "warning");
    assert.equal(info.canEditServiceLocation, false);
    assert.equal(info.showOnboardingLink, true);
    assert.ok(info.message.toLowerCase().includes("changes"));
});

test("changes_requested status: includes review reason when provided", () => {
    const reason = "Missing workshop address";
    const info = getApplicationStatusInfo("changes_requested", reason);

    assert.ok(info.message.includes(reason));
    assert.equal(info.showOnboardingLink, true);
});

test("changes_requested status: generic message when no reason", () => {
    const info = getApplicationStatusInfo("changes_requested");

    assert.ok(info.message.toLowerCase().includes("update"));
    assert.ok(!info.message.includes("undefined"));
});

// ─── "approved" status ────────────────────────────────────────────────────────

test("approved status: allows editing, no onboarding link", () => {
    const info = getApplicationStatusInfo("approved");

    assert.equal(info.label, "Approved");
    assert.equal(info.variant, "success");
    assert.equal(info.canEditServiceLocation, true);
    assert.equal(info.showOnboardingLink, false);
    assert.ok(info.message.toLowerCase().includes("approved"));
});

// ─── "rejected" status ───────────────────────────────────────────────────────

test("rejected status: blocks editing, no onboarding link", () => {
    const info = getApplicationStatusInfo("rejected");

    assert.equal(info.label, "Rejected");
    assert.equal(info.variant, "destructive");
    assert.equal(info.canEditServiceLocation, false);
    assert.equal(info.showOnboardingLink, false);
});

test("rejected status: includes rejection reason when provided", () => {
    const reason = "Insufficient documents";
    const info = getApplicationStatusInfo("rejected", reason);

    assert.ok(info.message.includes(reason));
    assert.equal(info.variant, "destructive");
});

test("rejected status: generic message when no reason", () => {
    const info = getApplicationStatusInfo("rejected");

    assert.ok(info.message.toLowerCase().includes("rejected"));
    assert.ok(!info.message.includes("undefined"));
});

// ─── Unknown/unexpected status ───────────────────────────────────────────────

test("unknown status: blocks editing, shows warning", () => {
    const info = getApplicationStatusInfo("some_unknown_status");

    assert.equal(info.label, "Unknown");
    assert.equal(info.variant, "warning");
    assert.equal(info.canEditServiceLocation, false);
    assert.equal(info.showOnboardingLink, false);
    assert.ok(info.message.includes("some_unknown_status"));
});

// ─── Consistency checks ──────────────────────────────────────────────────────

test("only approved status allows editing", () => {
    const statuses = [
        "incomplete",
        "pending",
        "under_review",
        "changes_requested",
        "approved",
        "rejected",
    ];

    for (const status of statuses) {
        const info = getApplicationStatusInfo(status);
        if (status === "approved") {
            assert.equal(
                info.canEditServiceLocation,
                true,
                `${status} should allow editing`
            );
        } else {
            assert.equal(
                info.canEditServiceLocation,
                false,
                `${status} should NOT allow editing`
            );
        }
    }
});

test("every known status returns a non-empty message and label", () => {
    const statuses = [
        "incomplete",
        "pending",
        "under_review",
        "changes_requested",
        "approved",
        "rejected",
    ];

    for (const status of statuses) {
        const info = getApplicationStatusInfo(status);
        assert.ok(info.label.length > 0, `${status} label is empty`);
        assert.ok(info.message.length > 0, `${status} message is empty`);
    }
});

