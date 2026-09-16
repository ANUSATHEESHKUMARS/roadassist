import { TokenPayload } from "../types/TokenPayload.js";
import { RefreshTokenPayload } from "../types/RefreshTokenPayload.js";


export interface ITokenService{
    generateAccessToken(payload : TokenPayload):string;
    generateRefreshToken(payload : RefreshTokenPayload): string;
    verifyAccessToken(token : string):TokenPayload;
    verifyRefreshToken(token : string):RefreshTokenPayload;
    
}