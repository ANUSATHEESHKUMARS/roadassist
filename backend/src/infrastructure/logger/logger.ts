import { ILogger } from "../../application/contracts/ILogger.js";


export class Logger implements ILogger{
    info(message: string): void {
        console.log(`[INFO] ${message}`)
    }
    error(message: string, error?: unknown): void {
        console.log(`[ERROR] ${message}` , error)
    }
    warn(message: string): void {
        console.log(`[WARN] ${message}`)
    }
    debug(message: string): void {
        console.log(`[DEBUG] ${message}`)
    }
}