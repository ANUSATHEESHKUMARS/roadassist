import { ITokenService } from "../../application/contracts/ITokenService.js";
import  Jwt  from "jsonwebtoken";

export class JwtTokenService implements ITokenService{
    generateToken(payload: object): string {
        return Jwt.sign(
            payload,
            process.env.SECRET_KEY as string,{
                expiresIn : "1d"
            }
        )
    }
}


