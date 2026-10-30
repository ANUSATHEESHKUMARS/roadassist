import { UserRole } from "../../domain/User/entities/User.js";

export interface IAccesstoken {
    userId : string;
    email : string,
    roles :UserRole[]
}