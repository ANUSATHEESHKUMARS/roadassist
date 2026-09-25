import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IGetUserUseCase } from "../../../application/interfaces/admin/IGetUserUseCase.js";
import { IAdminUserController } from "../../interfaces/admin/IAdminController.js";
import { Request, Response } from "express";

export class AdminController implements IAdminUserController {
   constructor(private getUserUseCase: IGetUserUseCase) { }
   getUsers = async (req: Request, res: Response): Promise<void> => {
      const search = typeof req.query.search === "string" ? req.query.search : undefined
      const page = typeof req.query.page === "string" ? Number(req.query.page) : 1
      const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 10
      const result = await this.getUserUseCase.execute(search,
         page,
         limit
      );
      res.status(HttpStatusCode.OK).json({
         success: true,
         data: result.users,
         pagination: result.pagination
      })
   }
}


