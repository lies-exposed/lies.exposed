import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseFrontmatter } from "../Common/BaseFrontmatter";
import { markdownRemark } from "../Common/Markdown";

export const PROJECT_TRANSACTION = "ProjectTransaction";
export const ProjectTransaction = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal("ProjectTransaction"),
    project: t.string,
    transaction: t.string,
    date: DateFromISOString,
  },
  PROJECT_TRANSACTION
);

export type ProjectTransaction = t.TypeOf<typeof ProjectTransaction>;

export const ProjectTransactionMD = markdownRemark(
  ProjectTransaction,
  "ProjectTransactionMD"
);
export type ProjectTransactionMD = t.TypeOf<typeof ProjectTransactionMD>;
