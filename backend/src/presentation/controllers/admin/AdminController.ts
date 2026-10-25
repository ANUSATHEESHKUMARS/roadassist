import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IBlockUserUseCase } from "../../../application/interfaces/admin/IBlockUserUseCase.js";
import { IGetUserUseCase } from "../../../application/interfaces/admin/IGetUserUseCase.js";
import { IUnblockUserUseCase } from "../../../application/interfaces/admin/IUnblockuserUseCase.js";
import { IApproveMechanicApplicationUseCase } from "../../../application/interfaces/IApproveMechanicApplicationUseCase.js";
import { IRejectMechanicApplictionUseCase } from "../../../application/interfaces/IRejectMechanicApplicaitonUseCase.js";
import { IGetMechanicApplicationUseCase } from "../../../application/interfaces/mechanic/IGetMechanicApplicationUseCase.js";
import { MechanicApplicationMapper } from "../../../application/mappers/MechanicApplicationMapper.js";
import { MechanicApplicationStatus } from "../../../domain/User/entities/MechanicApplication.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";
import { IAdminUserController } from "../../interfaces/admin/IAdminController.js";
import { Request, Response } from "express";

const VALID_STATUSES: MechanicApplicationStatus[] = [
   "incomplete",
   "pending",
   "under_review",
   "changes_requested",
   "approved",
   "rejected",
]
export class AdminController implements IAdminUserController {

   constructor(private getUserUseCase: IGetUserUseCase,
      private getMechanicApplicationUseCase: IGetMechanicApplicationUseCase,
      private blockUserUseCase: IBlockUserUseCase,
      private unblockUserUseCase: IUnblockUserUseCase,
      private approveMechanicApplicationUseCase: IApproveMechanicApplicationUseCase,
      private rejectMechanicApplicationUseCases: IRejectMechanicApplictionUseCase
   ) { }

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
   getMechanicApplication = async (req: Request, res: Response): Promise<void> => {
      const requestedStatus = req.query.status ?? "pending"
      if (typeof requestedStatus !== "string" ||
         !VALID_STATUSES.includes(requestedStatus as MechanicApplicationStatus)
      ) {
         const response: CommonResponse = {
            success: false,
            message: "Invalid mechanic application status"
         }
         res.status(HttpStatusCode.BAD_REQUEST).json(response)
         return
      }
      const status = requestedStatus as MechanicApplicationStatus;
      const application = await this.getMechanicApplicationUseCase.execute(status)

      const response: CommonResponse<ReturnType<typeof MechanicApplicationMapper.toResponse>[] >= {
         success: true,
         message: "Mechanic application retrieved succesfully",
           data: application.map(
    (item) => MechanicApplicationMapper.toResponse(item)
  ),
      }
      res.status(HttpStatusCode.OK).json(response)
   }

   blockUser = async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params
      if (typeof userId !== 'string' || !userId.trim()) {
         const response: CommonResponse = {
            success: false,
            message: "user Id is  required"
         }
         res.status(HttpStatusCode.BAD_REQUEST).json(response)
         return
      }
      const user = await this.blockUserUseCase.execute(userId)
      const response: CommonResponse<typeof user> = {
         success: true,
         message: "User blocked Successfullyy",
         data: user
      }
      res.status(HttpStatusCode.OK).json(response)
   }

   unblockUser = async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params
      if (typeof userId !== "string" || !userId.trim()) {
         const response: CommonResponse = {
            success: false,
            message: "User Id is required"
         }
         res.status(HttpStatusCode.BAD_REQUEST).json(response)
         return
      }

      const user = await this.unblockUserUseCase.execute(userId)

      const response: CommonResponse<typeof user> = {
         success: true,
         message: "User Unblocked succesfully",
         data: user
      }
      res.status(HttpStatusCode.OK).json(response)
   }

   approveMechanicApplication = async (
      req: Request,
      res: Response
   ): Promise<void> => {
      const applicationId = req.params.applicationId;
      if (typeof applicationId !== "string" || !applicationId.trim()) {
         const response: CommonResponse = {
            success: false,
            message: "Valid application Id is required"
         }
         res.status(HttpStatusCode.BAD_REQUEST).json(response)
         return
      }
      const adminId = req.user?.userId;

      if (!adminId) {

         const response: CommonResponse = {
            success: false,
            message: "Authentication required"
         }
         res.status(HttpStatusCode.UNAUTHORIZED).json(response)
         return;
      }


      const application =
         await this.approveMechanicApplicationUseCase.execute(
            applicationId,
            adminId
         );

      const response: CommonResponse<ReturnType<typeof MechanicApplicationMapper.toResponse>> = {
         success: true,
         message: "Mechanic application approved successfully",
         data: MechanicApplicationMapper.toResponse(application)
      }
      res.status(HttpStatusCode.OK).json(response)
   };

   rejectMechanicApplication = async (
      req: Request,
      res: Response
   ): Promise<void> => {
      const applicationId = req.params.applicationId;
      if (typeof applicationId !== "string" || !applicationId.trim()) {

         const response: CommonResponse = {
            success: false,
            message: "Application ID is required"
         }
         res.status(HttpStatusCode.BAD_REQUEST).json(response)
         return;
      }
      const adminId = req.user?.userId;

      const { reason } = req.body as { reason?: string };

      if (!adminId) {
         res.status(HttpStatusCode.UNAUTHORIZED).json({
            success: false,
            message: "Authentication required"
         });
         return;
      }

      if (typeof reason !== "string" || !reason.trim()) {
         res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: "Rejection reason is required"
         });
         return;
      }

      const application =
         await this.rejectMechanicApplicationUseCases.execute(
            applicationId,
            adminId,
            reason
         );


      const response: CommonResponse<ReturnType<typeof MechanicApplicationMapper.toResponse>> = {
         success: true,
         message: "Mechanic application rejected successfully",
         data: MechanicApplicationMapper.toResponse(application)
      }
      res.status(HttpStatusCode.OK).json(response)
   };
}


