import * as t from "io-ts";

export const AdminMediaStatsTotals = t.strict(
  {
    orphans: t.number,
    match: t.number,
    temp: t.number,
    noThumbnails: t.number,
    needRegenerateThumbnail: t.number,
  },
  "AdminMediaStatsTotals",
);
export type AdminMediaStatsTotals = t.TypeOf<typeof AdminMediaStatsTotals>;

export const AdminMediaStats = t.strict(
  {
    orphans: t.array(t.any),
    match: t.array(t.any),
    temp: t.array(t.any),
    noThumbnails: t.array(t.any),
    needRegenerateThumbnail: t.array(t.any),
  },
  "AdminMediaStats",
);
export type AdminMediaStats = t.TypeOf<typeof AdminMediaStats>;
