import "reflect-metadata";
import { RequestContextDto } from "perm-log-library/build/util";
import mongoose from "mongoose";
import { EnvVars, loadEnv } from "./util/parse-env";
import server from "./server";

declare module "express-serve-static-core" {
  interface Request {
    context: RequestContextDto;
  }
}

(async () => {
  try {
    loadEnv();

    const app = await server();

    app.listen(EnvVars.APP_PORT, async () => {
      console.log(`Listening on port ${EnvVars.APP_PORT}!!`);

      await mongoose.connect(`mongodb://${EnvVars.MONGODB_URI}/log`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
