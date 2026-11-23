
import mongoose from "mongoose";
import { EmergencyRequestModel } from "./models/EmergencyRequestModel.js";

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);

        console.log("MongoDB Atlas connected successfully");
        console.log("Database:", mongoose.connection.name);
        console.log("Host:", mongoose.connection.host);

        const indexes =
            await EmergencyRequestModel.collection.indexes();

        const geoIndexExists = indexes.some(
            index =>
                index.key.geoLocation === "2dsphere"
        );

        if (!geoIndexExists) {
            await EmergencyRequestModel.collection.createIndex(
                { geoLocation: "2dsphere" },
                { name: "geoLocation_2dsphere" }
            );

            console.log("Geospatial index created");
        } else {
            console.log("Geospatial index already exists");
        }

    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};
