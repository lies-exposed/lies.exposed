import { Schema } from "effect";

export const Color = Schema.String.pipe(Schema.brand("Color")).pipe(
  Schema.filter((s) => s.length === 6 && !s.includes("#")),
);

export type Color = typeof Color.Type;
