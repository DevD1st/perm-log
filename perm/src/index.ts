import "reflect-metadata";
import express from "express";
import { EnvVars, loadEnv } from "./util/parse-env";
import { PermController } from "./controllers/perm.controller";
import { Request, Response, NextFunction } from "express";
import {
  PermLogError,
  PermLogErrorCodeEnum,
} from "perm-log-library/build/error";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { EventPublisher } from "perm-log-library/build/publisher";

(async () => {
  try {
    loadEnv();

    await EventPublisher.init(EnvVars.RABBITMQ_URI);

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded());

    app.use("/perm", PermController);

    app.use((_, res) => {
      // TODO: there should be a not found status code
      res.status(StatusCodes.NOT_FOUND).json({
        name: "NOT_FOUND",
        message: ReasonPhrases.NOT_FOUND,
      });
    });

    app.use((error: Error, req: Request, res: Response, _: NextFunction) => {
      // TODO: log error, add optional HTTP status code to PermLogError
      // should have a response dto
      let name = PermLogErrorCodeEnum.Unknown;
      let message = "Error occurred, please try again later.";

      if (error instanceof PermLogError) name = error.name;
      message = error.message;

      // TODO: should have 'data' in response, it holds more information about the response
      res.status(StatusCodes.BAD_REQUEST).json({
        name,
        message,
      });
    });

    app.listen(EnvVars.APP_PORT, () => {
      console.log(`Listening on port ${EnvVars.APP_PORT}!!`);
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
})();
