export class Vehicle {
    constructor(
        public userId: string,
        public registrationNumber: string,
        public vehicleType: VehicleType,
        public brand: string,
        public model: string,
        public year: number,
        public fuelType: FuelType,
        public color: string,
        public vehicleImage?: string,
        public insuranceCertificateImage?: string,
        public pucCertificateImage?: string,
        public vehicleId?: string
    ) { }
}

export type FuelType =
    | "petrol"
    | "diesel"
    | "electric";

export type VehicleType =
    | "car"
    | "bike"
    | "auto"
    | "ev"

