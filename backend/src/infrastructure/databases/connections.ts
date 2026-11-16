import mongoose from "mongoose";
import { EmergencyRequestModel } from "./models/EmergencyRequestModel.js";


export const connectDB = async (): Promise<void> => {
   try {
      await mongoose.connect(process.env.MONGO_URI!);
      console.log("MongoDB Atlas connected succesfully...")

      await EmergencyRequestModel.collection.createIndex({
         geoLocation: "2dsphere"
      });
      console.log("Emergency request geospatial index created successfully...");

   } catch (error) {
      console.error("MongoDB Atlas connection failed", error)
      process.exit(1)
   }
}