import * as t from "io-ts";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { Polygon } from "./Common/Polygon";

export const Area = t.strict(
  {
    ...BaseFrontmatter.type.props,
    label: t.string,
    body: t.string,
    geometry: Polygon,
  },
  "Area"
);

export type Area = t.TypeOf<typeof Area>;
