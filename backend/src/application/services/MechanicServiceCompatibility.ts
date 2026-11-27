import { MechanicApplication } from "../../domain/User/entities/MechanicApplication.js";
import { MechanicCategory } from "../../domain/User/entities/MechanicCategory.js";

function normalizeServiceText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeServiceSlug(value: string): string {
    return value.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

export class MechanicServiceCompatibility {
    /**
     * Verifies whether an approved mechanic application supports the requested
     * vehicle type (exact case-insensitive match against supportedVehicleTypes).
     */
    static supportsVehicleType(
        app: MechanicApplication,
        vehicleType: string
    ): boolean {
        const target = vehicleType.trim().toLowerCase();
        if (!target) {
            return false;
        }
        return app.supportedVehicleTypes.some(
            (type) => type.trim().toLowerCase() === target
        );
    }

    /**
     * Verifies whether an approved mechanic application offers the requested
     * service, checking both:
     * 1) Custom/explicit entries in `app.serviceOffered` (case-insensitive)
     * 2) Admin-approved specializations (`verificationStatus === "approved"`)
     *    matched against active category/subcategory names and slugs.
     */
    static offersService(
        app: MechanicApplication,
        requestedServiceType: string,
        categories: MechanicCategory[] = []
    ): boolean {
        const targetText = normalizeServiceText(requestedServiceType);
        const targetSlug = normalizeServiceSlug(requestedServiceType);

        if (!targetText) {
            return false;
        }

        const offeredMatch = app.serviceOffered.some((offered) => {
            const normalizedOffered = normalizeServiceText(offered);
            return (
                normalizedOffered === targetText ||
                normalizeServiceSlug(offered) === targetSlug
            );
        });

        if (offeredMatch) {
            return true;
        }

        if (categories.length === 0 || app.specializations.length === 0) {
            return false;
        }

        const categoryMap = new Map(
            categories
                .filter((cat) => cat.id && cat.isActive)
                .map((cat) => [cat.id!, cat])
        );

        for (const spec of app.specializations) {
            const category = categoryMap.get(spec.categoryId);
            if (!category) {
                continue;
            }

            const approvedSubIds = new Set(
                spec.subcategories
                    .filter((sub) => sub.verificationStatus === "approved")
                    .map((sub) => sub.subcategoryId)
            );

            if (approvedSubIds.size === 0) {
                continue;
            }

            if (
                normalizeServiceText(category.name) === targetText ||
                normalizeServiceSlug(category.slug) === targetSlug
            ) {
                return true;
            }

            for (const subcategory of category.subcategories) {
                if (
                    !subcategory.isActive ||
                    !subcategory.id ||
                    !approvedSubIds.has(subcategory.id)
                ) {
                    continue;
                }

                if (
                    normalizeServiceText(subcategory.name) === targetText ||
                    normalizeServiceSlug(subcategory.slug) === targetSlug
                ) {
                    return true;
                }
            }
        }

        return false;
    }
}

