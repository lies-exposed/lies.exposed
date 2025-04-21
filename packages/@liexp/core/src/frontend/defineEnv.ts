import { Schema } from "effect";

export const defineEnv = <P extends Schema.Struct.Fields>(
  fn: (io: typeof Schema) => P,
): Schema.Struct<P> => {
  return Schema.Struct<P>(fn(Schema)).annotations({
    title: "AppEnv",
  });
};
