import "reflect-metadata";
import { EnvVars, loadEnv } from "./util/parse-env";
import { PermController } from "./controllers/perm.controller";
import express, { Request, Response, NextFunction } from "express";
import {
  PermLogError,
  PermLogErrorCodeEnum,
} from "perm-log-library/build/error";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { EventPublisher } from "perm-log-library/build/publisher";
import {
  ReqContextMiddleware,
  ResponeNameEnum,
  ResponseDto,
} from "perm-log-library/build/util";

async function server() {
  try {
    loadEnv();

    await EventPublisher.init(EnvVars.RABBITMQ_URI);

    const app = express();

    app.use(ReqContextMiddleware);

    app.use(express.json());
    app.use(express.urlencoded());

    app.use("/compute", PermController);

    app.use((req, res) => {
      res.status(StatusCodes.NOT_FOUND).json(
        new ResponseDto({
          name: ResponeNameEnum.NOT_FOUND,
          message: ReasonPhrases.NOT_FOUND,
        })
      );
    });

    app.use((error: Error, _: Request, res: Response, _1: NextFunction) => {
      console.error(error);

      let name = PermLogErrorCodeEnum.Unknown;
      let message = "Error occurred, please try again later.";
      let data = undefined;

      if (error instanceof PermLogError) {
        name = error.name;
        message = error.message;
        data = error.data;
      }

      res.status(StatusCodes.BAD_REQUEST).json(
        new ResponseDto({
          name,
          message,
          data,
        })
      );
    });

    return app;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default server;
