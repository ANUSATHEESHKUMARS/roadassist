import type {
    EmergencyRequest,
    EmergencyRequestStatus
} from "../User/entities/EmergencyRequest.js";

export interface IEmergencyRequestRepository {
    create(request: EmergencyRequest): Promise<EmergencyRequest>;

    findById(requestId: string): Promise<EmergencyRequest | null>;

    findByUserId(userId: string): Promise<EmergencyRequest[]>;

    findActiveByUserId(userId : string):Promise<EmergencyRequest | null>

    findNearbyPending(
        latitude: number,
        longitude: number,
        radiusKm: number,
        excludeMechanicId: string
    ): Promise<EmergencyRequest[]>;

    atomicAccept(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRequest | null>;

    addRejection(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRequest | null>;

    findByIdPopulated(requestId: string): Promise<{
        request: EmergencyRequest;
        mechanicDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
    } | null>;

    findByIdWithCustomerDetails(requestId: string): Promise<{
        request: EmergencyRequest;
        customerDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
    } | null>;

    findByAssignedMechanicId(
        mechanicId: string
    ): Promise<EmergencyRequest[]>;

    findActiveAssignedMechanicIds(
        mechanicIds: string[],
        excludeRequestId?: string
    ): Promise<Set<string>>;

    updateAssignedRequestStatus(
        requestId: string,
        mechanicId: string,
        currentStatus: EmergencyRequestStatus,
        newStatus: EmergencyRequestStatus,
        timestamps?: Partial<{
            acceptedAt: Date;
            travelStartedAt: Date;
            arrivedAt: Date;
            completedAt: Date;
        }>
    ): Promise<EmergencyRequest | null>;

    cancelByCustomer(
        requestId: string,
        userId: string,
        reason?: string
    ): Promise<EmergencyRequest | null>;
}