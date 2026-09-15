import { PendingRegistration } from "../User/entities/PendingRegistration.js";

export interface IPendingRegistrationRepository{
    save(data : PendingRegistration):Promise<void>
    findByEmail(email: string):Promise<PendingRegistration | null>
    deleteByEmail(email :string):Promise<void>
}