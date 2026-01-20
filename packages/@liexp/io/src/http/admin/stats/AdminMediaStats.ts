import { Schema } from "effect";

export const AdminMediaStatsTotals = Schema.Struct({
  orphans: Schema.Number,
  match: Schema.Number,
  temp: Schema.Number,
  noThumbnails: Schema.Number,
  needRegenerateThumbnail: Schema.Number,
}).annotations({
  title: "AdminMediaStatsTotals",
});
export type AdminMediaStatsTotals = typeof AdminMediaStatsTotals.Type;

export const AdminMediaStats = Schema.Struct({
  orphans: Schema.Array(Schema.Any),
  match: Schema.Array(Schema.Any),
  temp: Schema.Array(Schema.Any),
  noThumbnails: Schema.Array(Schema.Any),
  needRegenerateThumbnail: Schema.Array(Schema.Any),
}).annotations({
  title: "AdminMediaStats",
});
export type AdminMediaStats = typeof AdminMediaStats.Type;
