import { Request, Response, NextFunction } from "express";

import { ICreateMechanicCategoryUseCase } from "../../../application/interfaces/admin/ICreateMechanicCategoryUseCase.js";
import { HttpStatusCode } from
    "../../../application/enum/httpCodes.js";
import { IGetMechanicCategoriesUseCase } from "../../../application/interfaces/admin/IGetMechanicCategoriesUseCase.js";
import { IUpdateMechanicCategoryStatusUseCase } from "../../../application/interfaces/admin/IUpdateMechanicCategoryStatusUseCase.js";
import { IUpdateMechanicCategoryUseCase } from "../../../application/interfaces/admin/IUpdateMechanicCategoryUseCase.js";

export class MechanicCategoryController {

    constructor(
        private readonly createMechanicCategoryUseCase: ICreateMechanicCategoryUseCase,
        private readonly getmechanciCategoryUseCase: IGetMechanicCategoriesUseCase,
        private readonly updateMechanicCategoryUseCase : IUpdateMechanicCategoryUseCase,
        private readonly updateMechanicCategoryStatusUseCase: IUpdateMechanicCategoryStatusUseCase,
    ) { }

    execute = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const category = await this.createMechanicCategoryUseCase.execute(
                req.body
            );

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: "Mechanic category created successfully",
                data: {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    subcategories: category.subcategories,
                    isActive: category.isActive,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt
                }
            });

        } catch (error) {
            next(error);
        }
    }

    getAll = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {


            const includeInactiveQuery = req.query.includeInactive;


            if (
                includeInactiveQuery !== undefined &&
                (
                    typeof includeInactiveQuery !== "string" ||
                    !["true", "false"].includes(includeInactiveQuery)
                )
            ) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "includeInactive must be true or false"
                });
                return;
            }


            const includeInactive =
                includeInactiveQuery === "true";


            const categories =
                await this.getmechanciCategoryUseCase.execute(
                    includeInactive
                );


            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Mechanic categories fetched successfully",

                data: categories.map(category => ({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    subcategories: category.subcategories,
                    isActive: category.isActive,
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt
                }))
            });

        } catch (error) {
            next(error);
        }
    }

    update = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const categoryId = req.params.id;

            if (!categoryId || typeof categoryId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid category ID"
                });
                return;
            }

            const result = await this.updateMechanicCategoryUseCase.execute(
                categoryId,
                req.body
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Mechanic category updated successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
    updateStatus = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {

            const id = req.params.id;

            if (!id || typeof id !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid category ID"
                });
                return;
            }
            const { isActive } = req.body;

            if (typeof isActive !== "boolean") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "isActive must be a boolean"
                });
                return;
            }

            const updatedCategory =
                await this.updateMechanicCategoryStatusUseCase.execute(
                    id,
                    isActive
                );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: `Mechanic category ${isActive ? "activated" : "deactivated"} successfully`,
                data: {
                    id: updatedCategory.id,
                    name: updatedCategory.name,
                    slug: updatedCategory.slug,
                    isActive: updatedCategory.isActive
                }
            });

        } catch (error) {
            next(error);
        }
    };

}