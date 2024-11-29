/* eslint-disable no-restricted-imports */
import { UUID } from "io-ts-types/lib/UUID.js";
import { v4, type Version4Options, validate } from "uuid";

function uuid(opts?: Version4Options): UUID {
  return v4(opts) as unknown as UUID;
}

export { UUID, uuid, validate };
