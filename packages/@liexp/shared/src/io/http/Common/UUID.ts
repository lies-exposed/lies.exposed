import { Schema } from "effect";

import { v6, type Version6Options, validate } from "uuid";

const UUID = Schema.UUID.pipe(Schema.brand("UUID"));
type UUID = typeof UUID.Type;

function uuid(opts?: Version6Options): UUID {
  return v6(opts) as unknown as UUID;
}

export { UUID, uuid, validate };
