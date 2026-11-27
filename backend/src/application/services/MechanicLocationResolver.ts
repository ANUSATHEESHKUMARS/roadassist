import { MechanicApplication } from "../../domain/User/entities/MechanicApplication.js";
import { calculateDistanceKm } from "../../shared/utils/haversine.js";

export type RequestedServiceMode = "mobile" | "workshop";

export interface ResolvedMechanicLocation {
    latitude: number;
    longitude: number;
    serviceRadiusKm: number;
    distanceKm: number;
    matchedModel: RequestedServiceMode;
}

function getValidCoordinatePair(
    latitude: number | undefined,
    longitude: number | undefined
): { latitude: number; longitude: number } | null {
    if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }
    return { latitude, longitude };
}

export class MechanicLocationResolver {
    static hasValidDiscoveryLocation(app: MechanicApplication): boolean {
        if (
            app.serviceRadiusKm === undefined ||
            !Number.isFinite(app.serviceRadiusKm) ||
            app.serviceRadiusKm <= 0
        ) {
            return false;
        }

        const mobileCoords = getValidCoordinatePair(app.latitude, app.longitude);
        const workshopCoords = getValidCoordinatePair(
            app.workshopLatitude ?? app.latitude,
            app.workshopLongitude ?? app.longitude
        );

        if (app.serviceModel === "workshop") {
            return workshopCoords !== null;
        }
        if (app.serviceModel === "both") {
            return mobileCoords !== null || workshopCoords !== null;
        }
        return mobileCoords !== null;
    }

    static resolveForCustomer(
        app: MechanicApplication,
        customerLat: number,
        customerLng: number,
        requestedMode?: RequestedServiceMode
    ): ResolvedMechanicLocation | null {
        const radius = app.serviceRadiusKm;
        if (radius === undefined || !Number.isFinite(radius) || radius <= 0) {
            return null;
        }

        if (app.serviceModel === "workshop") {
            if (requestedMode === "mobile") {
                return null;
            }
            const target = getValidCoordinatePair(
                app.workshopLatitude ?? app.latitude,
                app.workshopLongitude ?? app.longitude
            );
            if (!target) {
                return null;
            }
            const distanceKm = calculateDistanceKm(
                customerLat,
                customerLng,
                target.latitude,
                target.longitude
            );
            return distanceKm <= radius
                ? {
                      latitude: target.latitude,
                      longitude: target.longitude,
                      serviceRadiusKm: radius,
                      distanceKm,
                      matchedModel: "workshop",
                  }
                : null;
        }

        if (app.serviceModel === "both") {
            const candidates: ResolvedMechanicLocation[] = [];

            const mobileCoords =
                requestedMode !== "workshop"
                    ? getValidCoordinatePair(app.latitude, app.longitude)
                    : null;
            if (mobileCoords) {
                const mobileDistance = calculateDistanceKm(
                    customerLat,
                    customerLng,
                    mobileCoords.latitude,
                    mobileCoords.longitude
                );
                if (mobileDistance <= radius) {
                    candidates.push({
                        latitude: mobileCoords.latitude,
                        longitude: mobileCoords.longitude,
                        serviceRadiusKm: radius,
                        distanceKm: mobileDistance,
                        matchedModel: "mobile",
                    });
                }
            }

            const workshopCoords =
                requestedMode !== "mobile"
                    ? getValidCoordinatePair(
                          app.workshopLatitude ?? app.latitude,
                          app.workshopLongitude ?? app.longitude
                      )
                    : null;
            if (workshopCoords) {
                const workshopDistance = calculateDistanceKm(
                    customerLat,
                    customerLng,
                    workshopCoords.latitude,
                    workshopCoords.longitude
                );
                if (workshopDistance <= radius) {
                    candidates.push({
                        latitude: workshopCoords.latitude,
                        longitude: workshopCoords.longitude,
                        serviceRadiusKm: radius,
                        distanceKm: workshopDistance,
                        matchedModel: "workshop",
                    });
                }
            }

            if (candidates.length === 0) {
                return null;
            }
            candidates.sort((a, b) => a.distanceKm - b.distanceKm);
            return candidates[0]!;
        }

        // Default / "mobile"
        if (requestedMode === "workshop") {
            return null;
        }
        const mobileCoords = getValidCoordinatePair(app.latitude, app.longitude);
        if (!mobileCoords) {
            return null;
        }
        const distanceKm = calculateDistanceKm(
            customerLat,
            customerLng,
            mobileCoords.latitude,
            mobileCoords.longitude
        );
        return distanceKm <= radius
            ? {
                  latitude: mobileCoords.latitude,
                  longitude: mobileCoords.longitude,
                  serviceRadiusKm: radius,
                  distanceKm,
                  matchedModel: "mobile",
              }
            : null;
    }
}
