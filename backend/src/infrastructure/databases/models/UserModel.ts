import { Schema , model , Document} from 'mongoose';

export interface IUserDocuments extends Document {

    fullName: string,
    email: string,
    phoneNumber: string,
    password:string,
    role : string

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
        required : true
    }

})


export const UserModel = model<IUserDocuments>("User",userSchema)