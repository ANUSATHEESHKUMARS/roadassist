import mongoose, {Schema  ,Types } from "mongoose";

export interface IVehicleDocument {
    _id: Types.ObjectId,
    userId : string,
    registrationNumber:string,
    brand:string,
    model:string,
    year:number,
    fuelType:"petrol"|"diesel"|"electric",
    color:string

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
    }

})

export const VehicleModel =  mongoose.model<IVehicleDocument>("Vehicle",vehicleSchema)