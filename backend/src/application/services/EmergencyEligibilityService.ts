import {
    EmergencyIssueCategory,
    EmergencyRequest,
} from "../../domain/User/entities/EmergencyRequest.js";
import { MechanicApplication } from "../../domain/User/entities/MechanicApplication.js";
import { MechanicAvailability } from "../../domain/User/entities/MechanicAvailability.js";
import { MechanicCategory } from "../../domain/User/entities/MechanicCategory.js";
import { User } from "../../domain/User/entities/User.js";
import { calculateDistanceKm } from "../../shared/utils/haversine.js";
import { getEmergencyLocationFreshnessMinutes } from "../constants/emergencyConfig.js";
import { MechanicServiceCompatibility } from "./MechanicServiceCompatibility.js";

const CATEGORY_KEYWORDS: Record<EmergencyIssueCategory, string[]> = {
    battery: ["battery", "jumpstart", "electrical"],
    flat_tyre: ["flat tyre", "tyre", "tire", "puncture", "wheel"],
    engine: ["engine", "engine repair", "overheating", "mechanical"],
    brake: ["brake", "brakes"],
    electrical: ["electrical", "wiring", "diagnostics", "battery"],
    fuel: ["fuel"],
    accident: ["accident", "towing", "recovery", "roadside", "emergency"],
    overheating: ["overheating", "cooling", "radiator", "engine"],
    noise: ["noise", "diagnostics", "inspection", "engine", "suspension"],
    other: ["other", "roadside", "general", "emergency"],
};

export interface MechanicEligibilityResult {
    eligible: boolean;
    reason?: string;
    distanceKm?: number;
}

export class EmergencyEligibilityService {
    static isLocationFresh(
        updatedAt?: Date,
        now: Date = new Date(),
        freshnessMinutes: number = getEmergencyLocationFreshnessMinutes()
    ): boolean {
        if (!updatedAt || Number.isNaN(updatedAt.getTime())) {
            return false;
        }
        const maxAgeMs = freshnessMinutes * 60 * 1000;
        return now.getTime() - updatedAt.getTime() <= maxAgeMs;
    }

    static supportsEmergencyCategory(
        app: MechanicApplication,
        issueCategory: EmergencyIssueCategory,
        categories: MechanicCategory[] = []
    ): boolean {
        if (issueCategory === "other") {
            const hasApprovedSpec = app.specializations.some((spec) =>
                spec.subcategories.some((sub) => sub.verificationStatus === "approved")
            );
            return app.serviceOffered.length > 0 || hasApprovedSpec;
        }

        const keywords = CATEGORY_KEYWORDS[issueCategory] ?? [issueCategory];

        for (const keyword of keywords) {
            if (MechanicServiceCompatibility.offersService(app, keyword, categories)) {
                return true;
            }
        }

        // Also match keyword substrings inside explicit serviceOffered / approved category names
        const offeredLower = app.serviceOffered.map((s) => s.toLowerCase());
        if (
            offeredLower.some((offered) =>
                keywords.some((kw) => offered.includes(kw) || kw.includes(offered))
            )
        ) {
            return true;
        }

        const activeCategoryMap = new Map(
            categories.filter((c) => c.id && c.isActive).map((c) => [c.id!, c])
        );
        for (const spec of app.specializations) {
            const cat = activeCategoryMap.get(spec.categoryId);
            if (!cat) continue;
            const approvedSubs = new Set(
                spec.subcategories
                    .filter((s) => s.verificationStatus === "approved")
                    .map((s) => s.subcategoryId)
            );
            if (approvedSubs.size === 0) continue;

            const catText = cat.name.toLowerCase();
            if (keywords.some((kw) => catText.includes(kw))) {
                return true;
            }
            for (const sub of cat.subcategories) {
                if (!sub.isActive || !sub.id || !approvedSubs.has(sub.id)) continue;
                const subText = sub.name.toLowerCase();
                if (keywords.some((kw) => subText.includes(kw))) {
                    return true;
                }
            }
        }

        return false;
    }

    static checkMechanicEligibility(params: {
        availability: MechanicAvailability | null | undefined;
        user: User | null | undefined;
        application: MechanicApplication | null | undefined;
        vehicleType: string;
        issueCategory: EmergencyIssueCategory;
        customerLatitude: number;
        customerLongitude: number;
        categories?: MechanicCategory[];
        hasIncompatibleActiveJob?: boolean;
        now?: Date;
        freshnessMinutes?: number;
    }): MechanicEligibilityResult {
        const {
            availability,
            user,
            application,
            vehicleType,
            issueCategory,
            customerLatitude,
            customerLongitude,
            categories = [],
            hasIncompatibleActiveJob = false,
            now = new Date(),
            freshnessMinutes = getEmergencyLocationFreshnessMinutes(),
        } = params;

        if (!availability || !availability.isAvailable) {
            return { eligible: false, reason: "Mechanic is offline" };
        }

        if (
            !Number.isFinite(availability.latitude) ||
            !Number.isFinite(availability.longitude)
        ) {
            return { eligible: false, reason: "Invalid mechanic location" };
        }

        if (!this.isLocationFresh(availability.updatedAt, now, freshnessMinutes)) {
            return { eligible: false, reason: "Mechanic location is stale" };
        }

        if (!user || user.status !== "active" || !user.roles.includes("mechanic")) {
            return { eligible: false, reason: "Mechanic account is inactive or invalid" };
        }

        if (!application || application.status !== "approved") {
            return { eligible: false, reason: "Mechanic application is not approved" };
        }

        if (hasIncompatibleActiveJob) {
            return { eligible: false, reason: "Mechanic has an active incompatible job" };
        }

        if (!MechanicServiceCompatibility.supportsVehicleType(application, vehicleType)) {
            return { eligible: false, reason: "Mechanic does not support vehicle type" };
        }

        if (!this.supportsEmergencyCategory(application, issueCategory, categories)) {
            return { eligible: false, reason: "Mechanic does not support issue category" };
        }

        const distanceKm = calculateDistanceKm(
            customerLatitude,
            customerLongitude,
            availability.latitude,
            availability.longitude
        );

        return {
            eligible: true,
            distanceKm,
        };
    }

    static sortRequestsByDistance(
        requests: EmergencyRequest[],
        mechanicLatitude: number,
        mechanicLongitude: number
    ): Array<{ request: EmergencyRequest; distanceKm: number }> {
        return requests
            .map((request) => ({
                request,
                distanceKm: Number(
                    calculateDistanceKm(
                        mechanicLatitude,
                        mechanicLongitude,
                        request.location.latitude,
                        request.location.longitude
                    ).toFixed(2)
                ),
            }))
            .sort((a, b) => a.distanceKm - b.distanceKm);
    }
}

