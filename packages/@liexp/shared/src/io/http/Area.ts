import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps";
import { Polygon } from "./Common/Polygon";

export const Area = t.strict(
  {
    ...BaseProps.type.props,
    label: t.string,
    body: t.string,
    geometry: Polygon,
  },
  "Area"
);

export type Area = t.TypeOf<typeof Area>;
