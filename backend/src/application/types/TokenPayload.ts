import { UserRole } from "../../domain/User/entities/User.js";

export interface TokenPayload {
    userId : string,
    email : string,
    roles : UserRole[];
    activeRole:UserRole
}


