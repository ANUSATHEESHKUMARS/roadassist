import jwt from 'jsonwebtoken'

import { ITokenService } from '../../application/contracts/ITokenService.js'
import { TokenPayload } from '../../application/types/TokenPayload.js'
import { RefreshTokenPayload } from '../../application/types/RefreshTokenPayload.js'

export class JwtTokenService implements ITokenService {
    generateAccesToken(payload: TokenPayload): string {
        return jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET_KEY!,{
                expiresIn : "15min"
            }
        )
    }
    generateRefreshToken(payload: RefreshTokenPayload): string {
        return jwt.sign(
            payload ,
            process.env.REFRESH_TOKEN_SECRET_KEY!,
            {
                expiresIn : "7d"
            }
        )
    }
    verifyAccesToken(token: string): TokenPayload {
        return jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET_KEY!,
        )as TokenPayload
    }
    verifyRefreshToken(token: string): RefreshTokenPayload {
        return jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET_KEY!
        )as RefreshTokenPayload
    }
}