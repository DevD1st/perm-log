import "reflect-metadata";
import { EnvVars } from "./util/parse-env";
import { RequestContextDto } from "perm-log-library/build/util";
import mongoose from "mongoose";
import server from "./server";

declare module "express-serve-static-core" {
  interface Request {
    context: RequestContextDto;
  }
}

(async () => {
  try {
    const app = await server();

    await mongoose.connect(`mongodb://${EnvVars.MONGODB_URI}/perm`);
    app.listen(EnvVars.APP_PORT, async () => {
      console.log(`Listening on port ${EnvVars.APP_PORT}!!`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
