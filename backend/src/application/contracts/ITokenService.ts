import { TokenPayload } from "../types/TokenPayload.js";
import { RefreshTokenPayload } from "../types/RefreshTokenPayload.js";


export interface ITokenService{
    generateAccesToken(payload : TokenPayload):string;
    generateRefreshToken(payload : RefreshTokenPayload): string;
    verifyAccesToken(token : string):TokenPayload;
    verifyRefreshToken(token : string):RefreshTokenPayload;
    
}