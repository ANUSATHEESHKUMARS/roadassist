export interface IVerifyPasswordResetOtpUseCase{
    execute(email : string , otp:string):Promise<{message:string , resetToken:string}>
}