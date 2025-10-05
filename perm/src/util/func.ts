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
      name: PermLogErrorCodeEnum.ValidationError,
      message: firstErrorMessage,
      data: validationResult,
    });
}

/**
 * calculate the factorial of a number
 */
export function factorial(n: number) {
  if (n < 0) return 0; // factorial not defined for negative numbers
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
