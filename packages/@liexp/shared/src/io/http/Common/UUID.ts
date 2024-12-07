/* eslint-disable no-restricted-imports */
import { UUID } from "io-ts-types/lib/UUID.js";
import { v6, type Version6Options, validate } from "uuid";

function uuid(opts?: Version6Options): UUID {
  return v6(opts) as unknown as UUID;
}

export { UUID, uuid, validate };
