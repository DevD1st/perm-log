import dotenv from "dotenv";
import { ParsedEnvDto } from "../dtos/parsed-env.dto";
import { plainToInstance } from "class-transformer";
import { DEFAULT_LISTENNING_PORT_IF_NON_SPECIFIED } from "./config";

export let EnvVars: ParsedEnvDto;

export function loadEnv() {
  const evnvs = dotenv.config();

  if (evnvs.error) {
    // the error is mostly because there is no .env which might be the case in some enviroments
    // assign a port manually
    process.env.APP_PORT = `${DEFAULT_LISTENNING_PORT_IF_NON_SPECIFIED}`;
  }

  EnvVars = plainToInstance(ParsedEnvDto, { ...process.env });
}
