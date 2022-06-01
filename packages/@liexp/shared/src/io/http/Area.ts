import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps";
import { Polygon } from "./Common/Polygon";
import { UUID } from "./Common/UUID";

export const Area = t.strict(
  {
    ...BaseProps.type.props,
    label: t.string,
    body: t.union([t.UnknownRecord, t.string, t.null]),
    geometry: Polygon,
    media: t.array(UUID),
  },
  "Area"
);

export type Area = t.TypeOf<typeof Area>;
