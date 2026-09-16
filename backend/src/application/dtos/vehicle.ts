export interface VehicleDto{
    registrationNumber : string,
    vehicleType:"car"|"bike"|"auto"|"ev"
    brand:string,
    model:string,
    year:number,
    fuelType:"petrol"|"diesel"|"electric",
    color:string,
    vehicleImage? : string,
    insuranceCertificateImage?:string,
    pucCertificateImage?:string

}