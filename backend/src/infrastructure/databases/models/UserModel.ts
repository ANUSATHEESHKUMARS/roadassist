import { Schema, model, Document } from 'mongoose';

export interface IUserDocuments extends Document {

    fullName: string,
    email: string,
    phoneNumber: string,
    password: string,
    role: UserRole,
    googleId?: string,
    authProvider: AuthProvider

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
    role: {
        type: String,
        required: true,
        enum: ["user", "admin", "mechanic"]
    },
    googleId:{
        type:String,
        unique : true,
        sparse:true
    },
    authProvider:{
        type:String,
        enum:["LOCAL","GOOGLE"],
        default:"LOCAL"
    }


})
export type UserRole =
    | "user"
    | "mechanic"
    | "admin"

export type AuthProvider =
    | "LOCAL"
    | "GOOGLE"

export const UserModel = model<IUserDocuments>("User", userSchema)
