import { Schema, model, Document } from 'mongoose';

export interface IUserDocuments extends Document {

    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    roles: UserRole[],
    googleId?: string,
    authProvider: AuthProvider,
    status: UserStatus,
    activeRole: UserRole

}

const userSchema = new Schema<IUserDocuments>({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    roles: {
        type: [{
            type: String,
            enum: ["user", "mechanic", "admin", "superadmin"]
        }],
        required: true,
        default: ["user"]
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    authProvider: {
        type: String,
        enum: ["LOCAL", "GOOGLE"],
        default: "LOCAL"
    },
    status: {
        type: String,
        required: true,
        enum: ["active", "blocked"],
        default: "active"
    },
    activeRole: {
        type: String,
        required: true,
        enum: ["user", "mechanic", "admin", "superadmin"],
        default: "user"
    }



})
export type UserRole =
    | "user"
    | "mechanic"
    | "admin"
    | "superadmin"

export type AuthProvider =
    | "LOCAL"
    | "GOOGLE"


export type UserStatus =
    | "active"
    | "blocked"

export const UserModel = model<IUserDocuments>("User", userSchema)
