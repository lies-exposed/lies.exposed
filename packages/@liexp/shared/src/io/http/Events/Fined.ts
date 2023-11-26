import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray";
import { BaseProps, BySubjectId, MoneyAmount } from "../Common";

const FINED_FRONTMATTER = t.literal("Fined");

export const Fined = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: FINED_FRONTMATTER,
    amount: MoneyAmount,
    who: BySubjectId,
    from: nonEmptyArray(BySubjectId),
    date: DateFromISOString,
  },
  FINED_FRONTMATTER.value,
);

export type Fined = t.TypeOf<typeof Fined>;
