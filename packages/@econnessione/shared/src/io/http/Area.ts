import * as t from "io-ts";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";


export const Area = t.strict(
  {
    ...BaseFrontmatter.type.props,
    label: t.string,
    color: t.string,
    body: t.string,
    geometry: t.string,
  },
  "Area"
);

export type Area = t.TypeOf<typeof Area>;
