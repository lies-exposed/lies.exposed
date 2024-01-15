import * as t from "io-ts";
import {
  optionFromNullable,
  type OptionFromNullableC,
} from "io-ts-types/lib/optionFromNullable.js";

export interface TOCItem {
  url?: string;
  title?: string;
  items?: TOCItem[] | undefined;
}

export const TOCItem: t.Type<TOCItem> = t.recursion("TOCItem", () =>
  t.partial(
    {
      url: t.string,
      title: t.string,
      items: t.union([t.undefined, t.array(TOCItem)]),
    },
    "TOCItem",
  ),
);

type MdxC<F extends t.Mixed> = t.ExactC<
  t.TypeC<{
    id: t.StringC;
    frontmatter: F;
    tableOfContents: OptionFromNullableC<
      t.TypeC<{
        items: t.UnionC<
          [t.UndefinedType, t.ArrayC<t.Type<TOCItem, TOCItem, unknown>>]
        >;
      }>
    >;
    timeToRead: OptionFromNullableC<t.NumberC>;
    body: t.StringC;
  }>
>;

export const markdownRemark = <F extends t.Mixed>(
  f: F,
  name: string,
): MdxC<F> =>
  t.strict(
    {
      id: t.string,
      frontmatter: f,
      tableOfContents: optionFromNullable(
        t.type({
          items: t.union([t.undefined, t.array(TOCItem)]),
        }),
      ),
      timeToRead: optionFromNullable(t.number),
      body: t.string,
    },
    name,
  );
