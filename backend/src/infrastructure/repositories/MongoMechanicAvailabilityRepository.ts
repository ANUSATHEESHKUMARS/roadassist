import { Types } from "mongoose";
import { IMechanicAvailabilityRepository } from "../../domain/repositories/IMechanicAvailabilityRepository.js";
import { MechanicAvailability } from "../../domain/User/entities/MechanicAvailability.js";
import { MechanicAvailabilityModel } from "../databases/models/MechanicAvailabilityModel.js";

export class MongoMechanicAvailabilityRepository implements IMechanicAvailabilityRepository {

    async upsert(
        mechanicId: string,
        isAvailable: boolean,
        latitude: number,
        longitude: number
    ): Promise<MechanicAvailability> {

        if (!Types.ObjectId.isValid(mechanicId)) {
            throw new Error("Invalid mechanic ID");
        }

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            throw new Error("Invalid location coordinates");
        }

        const document = await MechanicAvailabilityModel.findOneAndUpdate(
            { mechanicId: new Types.ObjectId(mechanicId) },
            {
                $set: {
                    isAvailable,
                    geoLocation: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                },
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
            }
        ).exec();

        return new MechanicAvailability(
            document.mechanicId.toString(),
            document.isAvailable,
            document.geoLocation.coordinates[1],
            document.geoLocation.coordinates[0],
            document._id.toString(),
            document.updatedAt
        );
    }

    async updateAvailabilityStatus(
        mechanicId: string,
        isAvailable: boolean
    ): Promise<MechanicAvailability | null> {

        if (!Types.ObjectId.isValid(mechanicId)) {
            return null;
        }

        const document = await MechanicAvailabilityModel.findOneAndUpdate(
            {
                mechanicId: new Types.ObjectId(mechanicId),
            },
            {
                $set: { isAvailable },
            },
            {
                new: true,
                runValidators: true,
            }
        ).exec();

        if (!document) {
            return null;
        }

        return new MechanicAvailability(
            document.mechanicId.toString(),
            document.isAvailable,
            document.geoLocation.coordinates[1],
            document.geoLocation.coordinates[0],
            document._id.toString(),
            document.updatedAt
        );
    }

    async findByMechanicId(mechanicId: string): Promise<MechanicAvailability | null> {
        if (!Types.ObjectId.isValid(mechanicId)) {
            return null;
        }

        const document = await MechanicAvailabilityModel.findOne({
            mechanicId: new Types.ObjectId(mechanicId),
        }).exec();

        if (!document) {
            return null;
        }

        return new MechanicAvailability(
            document.mechanicId.toString(),
            document.isAvailable,
            document.geoLocation.coordinates[1],
            document.geoLocation.coordinates[0],
            document._id.toString(),
            document.updatedAt
        );
    }
    async findNearbyAvailableMechanics(
        latitude: number,
        longitude: number,
        radiusKm: number
    ): Promise<MechanicAvailability[]> {
        const radiusInMeters = radiusKm * 1000;

        const documents = await MechanicAvailabilityModel.find({
            isAvailable: true,
            geoLocation: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: radiusInMeters,
                },
            },
        }).exec();

        return documents.map((document) =>
            new MechanicAvailability(
                document.mechanicId.toString(),
                document.isAvailable,
                document.geoLocation.coordinates[1],
                document.geoLocation.coordinates[0],
                document._id.toString(),
                document.updatedAt
            )
        );
    }
}

