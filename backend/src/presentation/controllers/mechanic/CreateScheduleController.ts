
import { Request, Response } from "express";

import { CommonResponse } from "../../../shared/types/CommonResponse.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";

import { IGetMechanicScheduleUseCase } from "../../../application/interfaces/mechanic/IGetMechanicScheduleUseCase.js";
import { ICreateMechanicScheduleUseCase } from "../../../application/interfaces/mechanic/ICreateMechanicScheduleUseCase.js";
import { IUpdateMechanicScheduleUseCase } from "../../../application/interfaces/mechanic/IUpdateMechanicScheduleUseCase.js";

export class MechanicScheduleController {

    constructor(
        private readonly createMechanicScheduleUseCase: ICreateMechanicScheduleUseCase,
        private readonly getMechanicScheduleUseCase: IGetMechanicScheduleUseCase,
        private readonly updateMechanicScheduleUseCase: IUpdateMechanicScheduleUseCase
    ) {}

    createSchedule = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const userId = req.user?.userId;

        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in."
            };

            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const schedule =
            await this.createMechanicScheduleUseCase.execute(
                userId,
                req.body
            );

        const response: CommonResponse<typeof schedule> = {
            success: true,
            message: "Mechanic schedule created successfully",
            data: schedule
        };

        res.status(HttpStatusCode.CREATED).json(response);
    };

    getSchedule = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const userId = req.user?.userId;

        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in."
            };

            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const schedule =
            await this.getMechanicScheduleUseCase.execute(userId);

        if (!schedule) {
            const response: CommonResponse = {
                success: false,
                message: "Mechanic schedule not found"
            };

            res.status(HttpStatusCode.NOT_FOUND).json(response);
            return;
        }

        const response: CommonResponse<typeof schedule> = {
            success: true,
            message: "Mechanic schedule retrieved successfully",
            data: schedule
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    updateSchedule = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const userId = req.user?.userId;

        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in."
            };

            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const updatedSchedule =
            await this.updateMechanicScheduleUseCase.execute(
                userId,
                req.body
            );

        const response: CommonResponse<typeof updatedSchedule> = {
            success: true,
            message: "Mechanic schedule updated successfully",
            data: updatedSchedule
        };

        res.status(HttpStatusCode.OK).json(response);
    };
}
