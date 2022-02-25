import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { ByGroupOrActor } from "./Common";
import { BaseProps } from "./Common/BaseProps";

export const TRANSACTION_FRONTMATTER = t.literal("TransactionFrontmatter");

export const TransactionFrontmatter = t.strict(
  {
    ...BaseProps.type.props,
    type: TRANSACTION_FRONTMATTER,
    amount: t.number,
    by: ByGroupOrActor,
    to: ByGroupOrActor,
    sources: t.array(t.string),
    date: DateFromISOString,
    createdAt: DateFromISOString,
  },
  TRANSACTION_FRONTMATTER.value
);

export type TransactionFrontmatter = t.TypeOf<typeof TransactionFrontmatter>;
