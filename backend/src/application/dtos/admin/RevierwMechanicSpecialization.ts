export type SpecializationReviewDecision = "approved" | "rejected";

export interface ReviewMechanicSpecializationDto {
    decision: SpecializationReviewDecision;
    rejectionReason?: string;
}