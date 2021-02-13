import * as t from "io-ts";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { JSONFromString } from "./Common/JSONFromString";
import { Polygon } from "./Common/Polygon";


export const Area = t.strict(
  {
    ...BaseFrontmatter.type.props,
    label: t.string,
    color: t.string,
    body: t.string,
    polygon: JSONFromString.pipe(Polygon),
  },
  "Area"
);

export type Area = t.TypeOf<typeof Area>;
