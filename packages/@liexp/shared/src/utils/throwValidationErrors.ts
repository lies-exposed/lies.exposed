import { type ParseError } from "effect/ParseResult";

export const throwValidationErrors = (errs: ParseError): null => {
  // eslint-disable-next-line no-console
  console.log(errs.toJSON());
  return null;
};
