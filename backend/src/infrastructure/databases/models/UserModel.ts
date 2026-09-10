import { Schema , model , Document} from 'mongoose';

export interface IUserDocuments extends Document {

    fullName: string,
    email: string,
    phoneNumber: string,
    password:string,
    role : UserRole

}

const userSchema = new Schema<IUserDocuments>({
    fullName :{
        type: String,
        required : true
    },
    email: {
        type : String,
        required : true,
        unique : true
    },
    phoneNumber : {
        type : String,
        required: true
    },
    password : {
        type:String,
        required : true
    },
    role :{
        type : String,
        required : true,
        enum:["user","admin","mechanic"]
    }

})
export type UserRole =
    | "user"
    | "mechanic"
    | "admin"
    

export const UserModel = model<IUserDocuments>("User",userSchema)