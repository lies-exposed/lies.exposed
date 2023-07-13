import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { markdownRemark } from "./Common/Markdown";

export const NetworkPageFrontmatter = t.type(
  {
    title: t.string,
    date: DateFromISOString,
    slug: t.string,
    cover: optionFromNullable(t.string),
  },
  "NetworkPageContentFileNodeFrontmatter",
);

export const NetworkPageMD = markdownRemark(
  NetworkPageFrontmatter,
  "NetworkPageMD",
);

export type NetworkPageMD = t.TypeOf<typeof NetworkPageMD>;
