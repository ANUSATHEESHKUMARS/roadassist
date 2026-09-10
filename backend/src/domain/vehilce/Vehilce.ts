export class Vehicle {
    constructor(
        public userId: string,
        public registrationNumber: string,
        public brand: string,
        public model: string,
        public year: number,
        public fuelType: FuelType,
        public color: string,
        public vehicleId?: string
    ) {}
}

export type FuelType =
    | "petrol"
    | "diesel"
    | "electric";

