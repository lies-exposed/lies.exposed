import { Schema } from "effect";
import { BaseProps, BySubjectId, MoneyAmount } from "../Common/index.js";

const FINED_FRONTMATTER = Schema.Literal("Fined");

export const Fined = Schema.Struct({
  ...BaseProps.fields,
  title: Schema.String,
  type: FINED_FRONTMATTER,
  amount: MoneyAmount,
  who: BySubjectId,
  from: Schema.NonEmptyArray(BySubjectId),
  date: Schema.Date,
}).annotations({ title: FINED_FRONTMATTER.Type });

export type Fined = typeof Fined.Type;
