export interface IRemoveVehicleUseCase{
    deleteById(vehicleId : string , userId : string):Promise<string>
}