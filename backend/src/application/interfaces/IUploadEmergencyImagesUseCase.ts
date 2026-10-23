export interface IUploadEmergencyRequestUploadUseCase{
    execute(userId:string , files:Express.Multer.File[]):Promise<string[]>
}