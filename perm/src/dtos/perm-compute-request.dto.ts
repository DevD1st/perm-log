import { IsNumber, Max, Min } from "class-validator";
import {
  MAX_COMPUTE_DECIMAL_PLACE,
  MAX_COMPUTE_DELAY_SEC,
  MIN_COMPUTE_DELAY_SEC,
} from "../util/config";
import { Expose } from "class-transformer";

export class PermComputeReqestDto {
  /**
   * term/number to compute
   */
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: MAX_COMPUTE_DECIMAL_PLACE,
    },
    {
      message: `Please povide a valid term with max of ${MAX_COMPUTE_DECIMAL_PLACE}d.p.`,
    }
  )
  @Expose()
  term!: number;

  /**
   * When should data be delete from redis. Data would be lost if computeTTLSec < time before calculation occurrs
   */
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 0,
    },
    {
      message: `Please provide a valid compute computeDelay within ${MIN_COMPUTE_DELAY_SEC}sec and ${MAX_COMPUTE_DELAY_SEC}sec.`,
    }
  )
  @Min(MIN_COMPUTE_DELAY_SEC, {
    message: `Please provide a valid compute computeDelay within ${MIN_COMPUTE_DELAY_SEC}sec and ${MAX_COMPUTE_DELAY_SEC}sec.`,
  })
  @Max(MAX_COMPUTE_DELAY_SEC, {
    message: `Please provide a valid compute computeDelay within ${MIN_COMPUTE_DELAY_SEC}sec and ${MAX_COMPUTE_DELAY_SEC}sec.`,
  })
  @Expose()
  computeDelay?: number;
}
