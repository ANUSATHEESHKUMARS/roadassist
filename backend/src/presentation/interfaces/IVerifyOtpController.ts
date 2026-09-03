import { Request , Response } from "express"

export interface IVerifyOtpController {
    execute(req : Request , res : Response): Promise<void>
}