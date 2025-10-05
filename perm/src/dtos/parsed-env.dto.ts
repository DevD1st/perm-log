import { Expose, Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class ParsedEnvDto {
  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    {
      message: "Please provide a APP_PORT environment variable.",
    }
  )
  @Expose()
  APP_PORT!: number;

  @IsString({
    message: "Please provide a REDIS_HOSTNAME environment variable.",
  })
  @Expose()
  REDIS_HOSTNAME!: string;

  @Type(() => Number)
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    {
      message: "Please provide a REDIS_PORT environment variable.",
    }
  )
  @Expose()
  REDIS_PORT!: number;

  @IsString({
    message: "Please provide a RABBITMQ_URI environment variable.",
  })
  @Expose()
  RABBITMQ_URI!: string;

  @IsString({
    message: "Please provide a MONGODB_URI environment variable.",
  })
  @Expose()
  MONGODB_URI!: string;
}
