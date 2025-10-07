import express, { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ResponeNameEnum, ResponseDto } from "perm-log-library/build/util";
import { DEFAULT_QUERY_LIMIT } from "../util/config";
import logService from "../services/log.service";

export const LogController = express.Router();

LogController.get(
  "",
  async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(`${req.query["limit"]}`) || DEFAULT_QUERY_LIMIT;
    const offset = parseInt(`${req.query["offset"]}`) || 0;

    const logs = await logService.fetchLogs(limit, offset);

    return res.status(StatusCodes.OK).json(
      new ResponseDto({
        name: ResponeNameEnum.SUCCESS,
        message: "success",
        data: logs,
      })
    );
  }
);
