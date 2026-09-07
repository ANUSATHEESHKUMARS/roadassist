import { TokenPayload } from "../../application/types/TokenPayload.ts";

declare global {
    namespace Express {
        interface Request{
            user? : TokenPayload
        }
    }
}

export {}