import {
     MechanicApplication,
     MechanicApplicationStatus,
     MechanicServiceModel,
} from "../../domain/User/entities/MechanicApplication.js"
import { ITransactionContext } from "../../infrastructure/databases/interface/ITransactionContext.js";

export interface ServiceLocationUpdateData {
     serviceModel: MechanicServiceModel;
     serviceAddress?: string;
     pincode?: string;
     latitude?: number;
     longitude?: number;
     serviceRadiusKm?: number;
     workshopName?: string;
     workshopAddress?: string;
}

export interface IMechanicApplicationRepository {

     create(application: MechanicApplication): Promise<MechanicApplication>

     findById(applicationId: string): Promise<MechanicApplication | null>

     findByUserId(userId: string): Promise<MechanicApplication | null>

     update(
          applicationId: string,
          application: MechanicApplication,
          unsetFields?: string[],
          transaction?: ITransactionContext
     ): Promise<MechanicApplication | null>;

     updateServiceLocation(
          applicationId: string,
          data: ServiceLocationUpdateData,
          unsetFields?: string[]
     ): Promise<MechanicApplication | null>;

     findByStatus(status: MechanicApplicationStatus): Promise<MechanicApplication[]>

     findByUserIds(userIds: string[]): Promise<MechanicApplication[]>

}



