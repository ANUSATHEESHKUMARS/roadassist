import mongoose, {Schema  ,Types } from "mongoose";

export interface IVehicleDocument {
    _id: Types.ObjectId,
    userId : string,
    registrationNumber:string,
    vehicleType:"car"|"bike"|"auto"|"ev"
    brand:string,
    model:string,
    year:number,
    fuelType:"petrol"|"diesel"|"electric",
    color:string
    vehicleImage?:string | undefined,
    insuranceCertificateImage?:string|undefined
    pucCertificateImage?:string | undefined

}

const vehicleSchema = new Schema<IVehicleDocument>({
    userId:{
        type: String,
        required:true
    },
    registrationNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    vehicleType :{
        type:String,
        required:true,
        enum:["car", "bike" , "auto" , "ev"]
    },
    brand:{
        type : String,
        required:true,
        trim:true
    },
    year: {
        type:Number,
        required:true,
        
    },
    fuelType:{
        type:String,
        required :true,
        enum:["petrol","diesel","electric"]
    },
    color:{
        type:String,
        required:true,
        trim:true
    },
       vehicleImage: {
        type: String
    },
     insuranceCertificateImage: {
        type: String
    },
      pucCertificateImage: {
        type: String
    }

})

export const VehicleModel =  mongoose.model<IVehicleDocument>("Vehicle",vehicleSchema)