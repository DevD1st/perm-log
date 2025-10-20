import "reflect-metadata";
import { EnvVars } from "./util/parse-env";
import { RequestContextDto } from "perm-log-library/build/util";
import mongoose from "mongoose";
import server from "./server";
import { getAwareLogger } from "./aware-logger";
import { SeverityNumber } from "@opentelemetry/api-logs";

declare module "express-serve-static-core" {
  interface Request {
    context: RequestContextDto;
  }
}

(async () => {
  try {
    const logger = getAwareLogger("index");

    const app = await server();

    await mongoose.connect(`mongodb://${EnvVars.MONGODB_URI}/perm`);
    app.listen(EnvVars.APP_PORT, async () => {
      logger.emit({
        body: `Listening on port ${EnvVars.APP_PORT}!!`,
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
      });
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
