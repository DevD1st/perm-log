import { plainToInstance } from "class-transformer";
import express, { Request, Response, NextFunction } from "express";
import { PermComputeReqestDto } from "../dtos/perm-compute-request.dto";
import { validateDto } from "../util/func";
import { StatusCodes } from "http-status-codes";
import permService from "../services/perm.service";

export const PermController = express.Router();

PermController.post(
  "/compute",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(PermComputeReqestDto, req.body, {
        // excludeExtraneousValues: true,
      });
      await validateDto(dto);

      permService.permComputeRequested(dto);

      // TODO: response format
      return res.status(StatusCodes.CREATED).json({
        name: "OK",
        message: "Processing!!",
      });
    } catch (error) {
      next(error);
    }
  }
);
