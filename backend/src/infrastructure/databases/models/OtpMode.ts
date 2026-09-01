import mongoose, { Schema, Document, Types } from "mongoose";

//mongoose ur using to crate the model 
//Schema is used tocreate the struture and rule of mongodb document
//// DOCUMENT  is a mongo typescript type


export interface IOtpDocument extends Document {
    userId :Types.ObjectId,
    email: string,
    codeHash: string,
    purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN",
    expiresAt: Date
    attempts: number,
    used: boolean,
    createdAt: Date

}

const otpSchema = new Schema<IOtpDocument>(
    {

        userId : {
            type : Schema.Types.ObjectId,
            required : true
        },
        email : {
            type : String,
            required : true,
            index : true
        },
        codeHash : {
            type : String,
            required : true,

        },
        purpose : {
            type : String,
            enum : ["EMAIL_VERIFICATION" , "PASSWORD_RESET", "LOGIN"],
            required : true
        },
        expiresAt : {
            type : Date,
            required : true
        },
        attempts : {
            type : Number,
            default : 0
        },
        used : {
            type : Boolean,
            required : false
        },
        
    },{
        timestamps : {
            createdAt : true,
            updatedAt : true
        }
    }

)


export const OtpModel = mongoose.model<IOtpDocument>("Otp", otpSchema)