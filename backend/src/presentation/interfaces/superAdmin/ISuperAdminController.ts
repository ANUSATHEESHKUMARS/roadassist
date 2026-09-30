import { Request, Response } from "express";

export interface ISuperAdminController {
    getAdmins(
        req: Request,
        res: Response
    ): Promise<void>;
}