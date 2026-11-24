
export type MechanicApplicationStatus =
    | "incomplete"
    | "pending"
    | "under_review"
    | "changes_requested"
    | "approved"
    | "rejected";


export type MechanicServiceModel =
    | "mobile"
    | "workshop"
    | "both";


export type MechanicDocumentStatus =
    | "pending"
    | "verified"
    | "rejected";


export type SpecializationVerificationStatus =
    | "pending"
    | "approved"
    | "rejected";


export type SupportedVehicleType =
    | "car"
    | "bike"
    | "auto"
    | "ev";


export interface MechanicDocument {
    documentType: string;
    fileKey: string;
    originalName: string;
    mimeType: string;
    verificationStatus: MechanicDocumentStatus;
    rejectionReason?: string;
}

export interface SpecializationReviewHistory {
    decision: "approved" | "rejected";
    reviewedBy: string;
    reviewedAt: Date;
    rejectionReason?: string;
}
export interface MechanicSubSpecialization {
    subcategoryId: string;
    verificationStatus: SpecializationVerificationStatus;
    reviewedBy?: string;
    reviewedAt?: Date;
    rejectionReason?: string;
    reviewHistory?: SpecializationReviewHistory[];
}


export interface MechanicSpecialization {
    categoryId: string;
    subcategories: MechanicSubSpecialization[];
}


export interface MechanicApplicationProps {
    id?: string;
    userId: string;

    profilePhotoKey?: string;
    experienceYears?: number;

    specializations?: MechanicSpecialization[];

    supportedVehicleTypes?: SupportedVehicleType[];

    serviceOffered?: string[];

    professionalDescription?: string;

    serviceModel?: MechanicServiceModel;
    serviceAddress?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    serviceRadiusKm?: number;

    workshopName?: string;
    workshopAddress?: string;

    // Uploaded documents
    documents?: MechanicDocument[];

    // Overall application status
    status: MechanicApplicationStatus;

    submittedAt?: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    reviewReason?: string;

    createdAt?: Date;
    updatedAt?: Date;
}


export class MechanicApplication {

    constructor(
        private readonly props: MechanicApplicationProps
    ) { }


    get id(): string | undefined {
        return this.props.id;
    }

    get userId(): string {
        return this.props.userId;
    }

    get profilePhotoKey(): string | undefined {
        return this.props.profilePhotoKey;
    }

    get experienceYears(): number | undefined {
        return this.props.experienceYears;
    }

   get specializations(): MechanicSpecialization[] {
    return (this.props.specializations ?? []).map(item => ({
        categoryId: item.categoryId,

        subcategories: item.subcategories.map(sub => ({
            subcategoryId: sub.subcategoryId,
            verificationStatus: sub.verificationStatus,

            ...(sub.reviewedBy !== undefined && {
                reviewedBy: sub.reviewedBy
            }),

            ...(sub.reviewedAt !== undefined && {
                reviewedAt: sub.reviewedAt
            }),

            ...(sub.rejectionReason !== undefined && {
                rejectionReason: sub.rejectionReason
            }),

            ...(sub.reviewHistory !== undefined && {
                reviewHistory: sub.reviewHistory.map(history => ({
                    decision: history.decision,
                    reviewedBy: history.reviewedBy,
                    reviewedAt: history.reviewedAt,

                    ...(history.rejectionReason !== undefined && {
                        rejectionReason: history.rejectionReason
                    })
                }))
            })
        }))
    }));
}

    get supportedVehicleTypes(): SupportedVehicleType[] {
        return [...(this.props.supportedVehicleTypes ?? [])];
    }

    get serviceOffered(): string[] {
        return [...(this.props.serviceOffered ?? [])];
    }

    get professionalDescription(): string | undefined {
        return this.props.professionalDescription;
    }

    get serviceModel(): MechanicServiceModel | undefined {
        return this.props.serviceModel;
    }

    get serviceAddress(): string | undefined {
        return this.props.serviceAddress;
    }

    get pincode(): string | undefined {
        return this.props.pincode;
    }

    get latitude(): number | undefined {
        return this.props.latitude;
    }

    get longitude(): number | undefined {
        return this.props.longitude;
    }

    get serviceRadiusKm(): number | undefined {
        return this.props.serviceRadiusKm;
    }

    get workshopName(): string | undefined {
        return this.props.workshopName;
    }

    get workshopAddress(): string | undefined {
        return this.props.workshopAddress;
    }

    get documents(): MechanicDocument[] {
        return (this.props.documents ?? []).map(document => ({
            documentType: document.documentType,
            fileKey: document.fileKey,
            originalName: document.originalName,
            mimeType: document.mimeType,
            verificationStatus: document.verificationStatus,
            ...(document.rejectionReason !== undefined
                ? { rejectionReason: document.rejectionReason }
                : {})
        }));
    }

    get status(): MechanicApplicationStatus {
        return this.props.status;
    }

    get submittedAt(): Date | undefined {
        return this.props.submittedAt;
    }

    get reviewedBy(): string | undefined {
        return this.props.reviewedBy;
    }

    get reviewedAt(): Date | undefined {
        return this.props.reviewedAt;
    }

    get reviewReason(): string | undefined {
        return this.props.reviewReason;
    }

    get createdAt(): Date | undefined {
        return this.props.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.props.updatedAt;
    }
}
