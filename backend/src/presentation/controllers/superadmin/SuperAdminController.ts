import { Request, Response } from "express";
import { IGetAdminsUseCase } from "../../../application/interfaces/superadmin/IGetAdminsUseCase.js";
import { ISuperAdminController } from "../../interfaces/superAdmin/ISuperAdminController.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";

export class SuperAdminController implements ISuperAdminController {
    constructor(private getAdminUseCase : IGetAdminsUseCase){}
 getAdmins = async (req: Request, res: Response): Promise<void> => {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const page = typeof req.query.page === "string"? Number(req
        .query.page
    ):1

    const limit = typeof req.query.limit === "string" ? Number(req.query.limit):10
     const result = await this.getAdminUseCase.execute(
        search,
        page,
        limit
     )
     res.status(HttpStatusCode.OK).json({
        success : true,
        data:result.admins,
        pagination:result.pagination
     })
 }
}