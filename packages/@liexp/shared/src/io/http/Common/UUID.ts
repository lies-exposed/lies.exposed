import { Schema } from "effect";

import { type Version4Options, validate, v4 } from "uuid";

const UUID = Schema.UUID.pipe(Schema.brand("UUID"));
type UUID = typeof UUID.Type;

function uuid(opts?: Version4Options): UUID {
  return v4(opts) as unknown as UUID;
}

export { UUID, uuid, validate };
