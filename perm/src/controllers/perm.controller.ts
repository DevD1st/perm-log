import { plainToInstance } from "class-transformer";
import express, { Request, Response, NextFunction } from "express";
import { PermComputeReqestDto } from "../dtos/perm-compute-request.dto";
import { validateDto } from "../util/func";
import { StatusCodes } from "http-status-codes";
import permService from "../services/perm.service";
import { ResponeNameEnum, ResponseDto } from "perm-log-library/build/util";
import { DEFAULT_QUERY_LIMIT } from "../util/config";

export const PermController = express.Router();

PermController.post(
  "",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(PermComputeReqestDto, req.body, {
        // excludeExtraneousValues: true,
      });
      await validateDto(dto);

      await permService.permComputeRequested(req.context, dto);

      return res.status(StatusCodes.CREATED).json(
        new ResponseDto({
          name: ResponeNameEnum.SUCCESS,
          message: "Processing!!",
        })
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * You are expected to optionally provide limit and offset query param
 */
PermController.get(
  "",
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(`${req.query["limit"]}`) || DEFAULT_QUERY_LIMIT;
    const offset = parseInt(`${req.query["offset"]}`) || 0;

    const perms = await permService.fetchPerms(limit, offset);

    return res.status(StatusCodes.OK).json(
      new ResponseDto({
        name: ResponeNameEnum.SUCCESS,
        message: "success",
        data: perms,
      })
    );
  }
);
