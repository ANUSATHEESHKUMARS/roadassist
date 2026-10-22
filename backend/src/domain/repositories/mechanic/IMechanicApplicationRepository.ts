import { MechanicApplication, MechanicApplicationStatus } from "../../User/entities/MechanicApplication.js";

export interface IMechanicApplicationRepository {

     create(application: MechanicApplication): Promise<MechanicApplication>

     findById(applicationId: string): Promise<MechanicApplication | null>

     findByUserId(userId: string): Promise<MechanicApplication | null>

     update(
          applicationId: string,
          application: MechanicApplication
     ): Promise<MechanicApplication | null>;

     findByStatus(status : MechanicApplicationStatus):Promise<MechanicApplication[]>

}



