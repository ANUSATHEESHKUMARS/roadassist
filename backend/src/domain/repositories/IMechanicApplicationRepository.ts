import { MechanicApplication, MechanicApplicationStatus } from "../../domain/User/entities/MechanicApplication.js"
import { ITransactionContext } from "../../infrastructure/databases/interface/ITransactionContext.js";

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

     findByStatus(status: MechanicApplicationStatus): Promise<MechanicApplication[]>

}



