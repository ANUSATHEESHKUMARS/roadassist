import test from "node:test";
import assert from "node:assert/strict";

import { MechanicApplication } from "../src/domain/User/entities/MechanicApplication.js";
import {
    IMechanicApplicationRepository,
    ServiceLocationUpdateData,
} from "../src/domain/repositories/IMechanicApplicationRepository.js";
import { UpdateMechanicServiceLocationUseCase } from "../src/application/useCase/mechanic/UpdateMechanicServiceLocatioUseCase.js";
import { MechanicApplicationController } from "../src/presentation/controllers/mechanic/SaveMechanicDraftController.js";
import { GetMyMechanicApplicationUseCase } from "../src/application/useCase/mechanic/GetMyMechanicApplicationUseCase.js";

function createApplicationRepo(seed?: MechanicApplication) {
    let stored: MechanicApplication | null = seed ?? null;
    let lastUpdateCall: {
        applicationId: string;
        data: ServiceLocationUpdateData;
        unsetFields: string[];
    } | null = null;
    let fullUpdateCalled = false;

    const repo: IMechanicApplicationRepository = {
        async create(a) { return a; },
        async findById(id) { return stored && stored.id === id ? stored : null; },
        async findByUserId(userId) {
            return stored && stored.userId === userId ? stored : null;
        },
        async update() {
            fullUpdateCalled = true;
            return null;
        },
        async updateServiceLocation(applicationId, data, unsetFields = []) {
            lastUpdateCall = { applicationId, data, unsetFields };
            if (!stored || stored.id !== applicationId) return null;

            const resolvedServiceAddress = unsetFields.includes("serviceAddress")
                ? undefined
                : (data.serviceAddress ?? stored.serviceAddress);
            const resolvedPincode = unsetFields.includes("pincode")
                ? undefined
                : (data.pincode ?? stored.pincode);
            const resolvedLatitude = unsetFields.includes("latitude")
                ? undefined
                : (data.latitude ?? stored.latitude);
            const resolvedLongitude = unsetFields.includes("longitude")
                ? undefined
                : (data.longitude ?? stored.longitude);
            const resolvedRadius = unsetFields.includes("serviceRadiusKm")
                ? undefined
                : (data.serviceRadiusKm ?? stored.serviceRadiusKm);
            const resolvedWorkshopName = unsetFields.includes("workshopName")
                ? undefined
                : (data.workshopName ?? stored.workshopName);
            const resolvedWorkshopAddress = unsetFields.includes("workshopAddress")
                ? undefined
                : (data.workshopAddress ?? stored.workshopAddress);

            stored = new MechanicApplication({
                ...(stored.id !== undefined && { id: stored.id }),
                userId: stored.userId,
                status: stored.status,
                specializations: stored.specializations,
                supportedVehicleTypes: stored.supportedVehicleTypes,
                serviceOffered: stored.serviceOffered,
                documents: stored.documents,
                serviceModel: data.serviceModel,
                ...(resolvedServiceAddress !== undefined && {
                    serviceAddress: resolvedServiceAddress,
                }),
                ...(resolvedPincode !== undefined && { pincode: resolvedPincode }),
                ...(resolvedLatitude !== undefined && { latitude: resolvedLatitude }),
                ...(resolvedLongitude !== undefined && { longitude: resolvedLongitude }),
                ...(resolvedRadius !== undefined && { serviceRadiusKm: resolvedRadius }),
                ...(resolvedWorkshopName !== undefined && {
                    workshopName: resolvedWorkshopName,
                }),
                ...(resolvedWorkshopAddress !== undefined && {
                    workshopAddress: resolvedWorkshopAddress,
                }),
            });
            return stored;
        },
        async findByStatus() { return []; },
        async findByUserIds() { return []; },
    };

    return {
        repo,
        getStored: () => stored,
        getLastUpdateCall: () => lastUpdateCall,
        wasFullUpdateCalled: () => fullUpdateCalled,
    };
}

function makeApprovedApplication(): MechanicApplication {
    return new MechanicApplication({
        id: "app_123",
        userId: "mech_1",
        status: "approved",
        specializations: [
            {
                categoryId: "cat_1",
                subcategories: [{ subcategoryId: "sub_1", verificationStatus: "approved" }],
            },
        ],
        supportedVehicleTypes: ["car", "bike"],
        serviceOffered: ["Engine Repair"],
        documents: [
            {
                documentType: "id_proof",
                fileKey: "docs/id.png",
                originalName: "id.png",
                mimeType: "image/png",
                verificationStatus: "verified",
            },
        ],
        serviceModel: "mobile",
        serviceAddress: "Old Street",
        pincode: "682001",
        latitude: 9.9312,
        longitude: 76.2673,
        serviceRadiusKm: 10,
    });
}

test("Updates mobile service location using targeted updateServiceLocation without modifying unrelated fields", async () => {
    const state = createApplicationRepo(makeApprovedApplication());
    const useCase = new UpdateMechanicServiceLocationUseCase(state.repo);

    const updated = await useCase.execute("mech_1", {
        serviceModel: "mobile",
        serviceAddress: "MG Road, Kochi",
        pincode: "682016",
        latitude: 9.965,
        longitude: 76.29,
        serviceRadiusKm: 15,
    });

    assert.equal(state.wasFullUpdateCalled(), false);
    assert.equal(updated.serviceModel, "mobile");
    assert.equal(updated.serviceAddress, "MG Road, Kochi");
    assert.equal(updated.pincode, "682016");
    assert.equal(updated.latitude, 9.965);
    assert.equal(updated.serviceRadiusKm, 15);
    assert.deepEqual(state.getLastUpdateCall()?.unsetFields, ["workshopName", "workshopAddress"]);

    // Unrelated fields preserved
    assert.deepEqual(updated.supportedVehicleTypes, ["car", "bike"]);
    assert.deepEqual(updated.serviceOffered, ["Engine Repair"]);
    assert.equal(updated.documents.length, 1);
    assert.equal(updated.specializations.length, 1);
    assert.equal(updated.status, "approved");
});

test("Workshop service model requires workshopName & workshopAddress and preserves latitude/longitude/serviceRadiusKm for discovery", async () => {
    const state = createApplicationRepo(makeApprovedApplication());
    const useCase = new UpdateMechanicServiceLocationUseCase(state.repo);

    const updated = await useCase.execute("mech_1", {
        serviceModel: "workshop",
        workshopName: "Apex Auto Hub",
        workshopAddress: "NH Bypass, Kochi",
    });

    assert.equal(updated.serviceModel, "workshop");
    assert.equal(updated.workshopName, "Apex Auto Hub");
    assert.equal(updated.workshopAddress, "NH Bypass, Kochi");
    // Discovery coordinates preserved
    assert.equal(updated.latitude, 9.9312);
    assert.equal(updated.longitude, 76.2673);
    assert.equal(updated.serviceRadiusKm, 10);
    assert.deepEqual(state.getLastUpdateCall()?.unsetFields, ["serviceAddress", "pincode"]);
});

test("Rejects invalid coordinates, invalid radius, invalid pincode, missing workshopName, missing application, and non-approved application", async () => {
    const state = createApplicationRepo(makeApprovedApplication());
    const useCase = new UpdateMechanicServiceLocationUseCase(state.repo);

    await assert.rejects(
        () =>
            useCase.execute("mech_1", {
                serviceModel: "mobile",
                serviceAddress: "MG Road",
                pincode: "123",
                latitude: 9.93,
                longitude: 76.26,
                serviceRadiusKm: 10,
            }),
        /6-digit Indian pincode/i
    );

    await assert.rejects(
        () =>
            useCase.execute("mech_1", {
                serviceModel: "mobile",
                serviceAddress: "MG Road",
                pincode: "682016",
                latitude: 120,
                longitude: 76.26,
                serviceRadiusKm: 10,
            }),
        /Invalid service coordinates/i
    );

    await assert.rejects(
        () =>
            useCase.execute("mech_1", {
                serviceModel: "mobile",
                serviceAddress: "MG Road",
                pincode: "682016",
                latitude: 9.93,
                longitude: 76.26,
                serviceRadiusKm: 150,
            }),
        /between 0\.1 and 100 km/i
    );

    await assert.rejects(
        () =>
            useCase.execute("mech_1", {
                serviceModel: "workshop",
                workshopName: "",
                workshopAddress: "NH Bypass",
            }),
        /Workshop name is required/i
    );

    // Missing application
    const emptyState = createApplicationRepo();
    const emptyUseCase = new UpdateMechanicServiceLocationUseCase(emptyState.repo);
    await assert.rejects(
        () =>
            emptyUseCase.execute("mech_1", {
                serviceModel: "mobile",
                serviceAddress: "MG Road",
                pincode: "682016",
                latitude: 9.93,
                longitude: 76.26,
                serviceRadiusKm: 10,
            }),
        /application not found/i
    );

    // Non-approved application
    const pendingApp = new MechanicApplication({
        id: "app_pending",
        userId: "mech_2",
        status: "pending",
    });
    const pendingState = createApplicationRepo(pendingApp);
    const pendingUseCase = new UpdateMechanicServiceLocationUseCase(pendingState.repo);
    await assert.rejects(
        () =>
            pendingUseCase.execute("mech_2", {
                serviceModel: "mobile",
                serviceAddress: "MG Road",
                pincode: "682016",
                latitude: 9.93,
                longitude: 76.26,
                serviceRadiusKm: 10,
            }),
        /Only approved mechanics/i
    );
});

test("MechanicApplicationController.updateServiceLocation returns CommonResponse with updated location data", async () => {
    const state = createApplicationRepo(makeApprovedApplication());
    const useCase = new UpdateMechanicServiceLocationUseCase(state.repo);
    const controller = new MechanicApplicationController(
        {} as never,
        {} as never,
        {} as never,
        useCase
    );

    let statusCode = 0;
    let jsonBody: unknown = null;

    await controller.updateServiceLocation(
        {
            user: { userId: "mech_1" },
            body: {
                serviceModel: "both",
                serviceAddress: "Edappally, Kochi",
                pincode: "682024",
                latitude: 10.02,
                longitude: 76.31,
                serviceRadiusKm: 12,
                workshopName: "Kochi Motors",
                workshopAddress: "Edappally Bypass",
            },
        } as never,
        {
            status(code: number) {
                statusCode = code;
                return {
                    json(body: unknown) {
                        jsonBody = body;
                    },
                };
            },
        } as never
    );

    assert.equal(statusCode, 200);
    const res = jsonBody as { success: boolean; message: string; data: Record<string, unknown> };
    assert.equal(res.success, true);
    assert.equal(res.data.serviceModel, "both");
    assert.equal(res.data.pincode, "682024");
    assert.equal(res.data.workshopName, "Kochi Motors");
});

test("MechanicApplicationController.getMyApplication isolates by userId and returns data: null when absent", async () => {
    const state = createApplicationRepo(makeApprovedApplication()); // owned by mech_1
    const getMyUC = new GetMyMechanicApplicationUseCase(state.repo);
    const controller = new MechanicApplicationController(
        {} as never,
        {} as never,
        getMyUC,
        {} as never
    );

    // Different user sees data: null
    let otherBody: unknown = null;
    await controller.getMyApplication(
        { user: { userId: "other_mech" } } as never,
        {
            status() {
                return {
                    json(body: unknown) {
                        otherBody = body;
                    },
                };
            },
        } as never
    );
    assert.equal((otherBody as { success: boolean; data: unknown }).success, true);
    assert.equal((otherBody as { data: unknown }).data, null);

    // Owner sees their application
    let ownerBody: unknown = null;
    await controller.getMyApplication(
        { user: { userId: "mech_1" } } as never,
        {
            status() {
                return {
                    json(body: unknown) {
                        ownerBody = body;
                    },
                };
            },
        } as never
    );
    assert.equal((ownerBody as { data: { userId: string } }).data.userId, "mech_1");
});
