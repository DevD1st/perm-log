import "@opentelemetry/context-async-hooks";
import "reflect-metadata";
import { RequestContextDto } from "perm-log-library/build/util";
import mongoose from "mongoose";
import { EnvVars, loadEnv } from "./util/parse-env";
import server from "./server";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { getAwareLogger } from "./util/aware-logger";

declare module "express-serve-static-core" {
  interface Request {
    context: RequestContextDto;
  }
}

(async () => {
  try {
    loadEnv();

    const logger = getAwareLogger("index");

    const app = await server();

    await mongoose.connect(`mongodb://${EnvVars.MONGODB_URI}/log`);

    app.listen(EnvVars.APP_PORT, () => {
      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
        body: `Listening on port ${EnvVars.APP_PORT}!!!`,
      });
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
