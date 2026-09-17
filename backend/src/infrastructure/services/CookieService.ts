import { ICookieService , CookieOptions } from "../../application/contracts/ICookieService.js";

import { Response } from "express";
export class CookieService implements ICookieService {


    setCookie(
        res : Response,
        name: string,
        value: string,
        options: CookieOptions = {}
    ): void {
        res.cookie(
            name,
            value,
            options
        );
    }

    clear(
        res:Response,
        name: string,
        options: CookieOptions = {}
    ): void {
        res.clearCookie(
            name,
            options
        );
    }
}