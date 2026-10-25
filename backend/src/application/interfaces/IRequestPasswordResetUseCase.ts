export interface IRequestPasswordResetUseCase{
    execute(email:string):Promise<{message:string}>
}