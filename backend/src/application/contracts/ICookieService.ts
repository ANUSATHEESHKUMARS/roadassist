import { Response } from "express";
export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
  path?: string;
}


export interface ICookieService {
    setCookie(
       res:Response,
        name:string,
        value:string,
        options?: CookieOptions
    ):void;

    clear(
        res:Response,
        name : string,
        options?:CookieOptions
    ):void
}


