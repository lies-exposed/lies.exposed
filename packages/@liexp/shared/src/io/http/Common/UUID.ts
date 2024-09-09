/* eslint-disable no-restricted-imports */
import { UUID } from "io-ts-types/lib/UUID.js";
import { v4, type V4Options, validate } from "uuid";

function uuid(opts?: V4Options): UUID {
  return v4(opts) as any as UUID;
}

export { UUID, uuid, validate };
