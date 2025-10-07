import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import {
  PermLogError,
  PermLogErrorCodeEnum,
} from "perm-log-library/build/error";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import {
  PermLogEventsEnum,
  QueueNameEnum,
  ReqContextMiddleware,
  ResponeNameEnum,
  ResponseDto,
} from "perm-log-library/build/util";
import { EventListener } from "perm-log-library/build/listener";
import { LogController } from "./controllers/log.controller";
import logService from "./services/log.service";
import { EnvVars, loadEnv } from "./util/parse-env";

async function server() {
  try {
    loadEnv();

    await EventListener.init(
      EnvVars.RABBITMQ_URI,
      QueueNameEnum.Log,
      [PermLogEventsEnum.PermRequested, PermLogEventsEnum.PermCalculated],
      logService.onQueueMessage
    );

    const app = express();

    app.use(ReqContextMiddleware);

    app.use(express.json());
    app.use(express.urlencoded());

    app.use("/all", LogController);

    app.use((_, res) => {
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
