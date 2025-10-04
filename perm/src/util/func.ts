import { validate } from "class-validator";
import {
  PermLogError,
  PermLogErrorCodeEnum,
} from "perm-log-library/build/error";

/**
 * Validates a dto, throws error if there is error
 */
export async function validateDto(dto: object) {
  const validationResult = await validate(dto);

  let firstErrorMessage = "Validation error.";
  if (validationResult.length && validationResult[0].constraints)
    firstErrorMessage = Object.entries(validationResult[0].constraints)[0][1];

  if (validationResult.length)
    throw new PermLogError({
      // TODO: should have validation error code
      name: PermLogErrorCodeEnum.Unknown,
      message: firstErrorMessage,
      data: validationResult,
    });
}
