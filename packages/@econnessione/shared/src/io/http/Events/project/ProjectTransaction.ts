import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseFrontmatter } from "../../Common/BaseFrontmatter";

export const PROJECT_TRANSACTION = "ProjectTransaction";
export const ProjectTransaction = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal(PROJECT_TRANSACTION),
    project: t.string,
    transaction: t.string,
    date: DateFromISOString,
  },
  PROJECT_TRANSACTION
);

export type ProjectTransaction = t.TypeOf<typeof ProjectTransaction>;
