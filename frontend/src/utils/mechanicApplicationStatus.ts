/**
 * Maps a mechanic-application status string to user-facing display metadata.
 *
 * The backend entity (`MechanicApplicationStatus`) defines the valid values:
 *   "incomplete" | "pending" | "under_review" | "changes_requested" | "approved" | "rejected"
 *
 * This helper is intentionally a pure function so it can be unit-tested
 * without rendering React components.
 */

export type StatusVariant = "info" | "warning" | "success" | "destructive";

export interface ApplicationStatusInfo {
    /** Short human-readable label (e.g. "Approved"). */
    label: string;
    /** Longer guidance message shown in the page banner. */
    message: string;
    /** Visual variant that drives banner styling. */
    variant: StatusVariant;
    /** Whether the mechanic should be allowed to edit the service-location form. */
    canEditServiceLocation: boolean;
    /** Whether the banner should suggest navigating to the onboarding page. */
    showOnboardingLink: boolean;
}

export function getApplicationStatusInfo(
    status: string,
    reviewReason?: string
): ApplicationStatusInfo {
    switch (status) {
        case "incomplete":
            return {
                label: "Incomplete",
                message:
                    "Your mechanic application is incomplete. Please complete all required onboarding steps and submit your application for review.",
                variant: "warning",
                canEditServiceLocation: false,
                showOnboardingLink: true,
            };

        case "pending":
            return {
                label: "Pending Review",
                message:
                    "Your mechanic application has been submitted and is waiting for admin review. You will be able to manage your service location once your application is approved.",
                variant: "info",
                canEditServiceLocation: false,
                showOnboardingLink: false,
            };

        case "under_review":
            return {
                label: "Under Review",
                message:
                    "Your mechanic application is currently being reviewed by an administrator. You will be notified once a decision is made.",
                variant: "info",
                canEditServiceLocation: false,
                showOnboardingLink: false,
            };

        case "changes_requested":
            return {
                label: "Changes Requested",
                message: reviewReason
                    ? `The admin has requested changes to your application: "${reviewReason}". Please update the requested information and resubmit.`
                    : "The admin has requested changes to your application. Please review your onboarding details, make the requested updates, and resubmit.",
                variant: "warning",
                canEditServiceLocation: false,
                showOnboardingLink: true,
            };

        case "approved":
            return {
                label: "Approved",
                message:
                    "Your mechanic application is approved. You can configure and update your service location below.",
                variant: "success",
                canEditServiceLocation: true,
                showOnboardingLink: false,
            };

        case "rejected":
            return {
                label: "Rejected",
                message: reviewReason
                    ? `Your mechanic application was rejected: "${reviewReason}". You may contact support or reapply after addressing the issues.`
                    : "Your mechanic application has been rejected. You may contact support or review your application for further details.",
                variant: "destructive",
                canEditServiceLocation: false,
                showOnboardingLink: false,
            };

        default:
            return {
                label: "Unknown",
                message: `Your mechanic application has an unrecognised status ("${status}"). Please contact support.`,
                variant: "warning",
                canEditServiceLocation: false,
                showOnboardingLink: false,
            };
    }
}

