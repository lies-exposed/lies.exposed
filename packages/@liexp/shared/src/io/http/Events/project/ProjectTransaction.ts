import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseProps } from "../../Common/BaseProps";

export const PROJECT_TRANSACTION = "ProjectTransaction";
export const ProjectTransaction = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal(PROJECT_TRANSACTION),
    project: t.string,
    transaction: t.string,
    date: DateFromISOString,
  },
  PROJECT_TRANSACTION
);

export type ProjectTransaction = t.TypeOf<typeof ProjectTransaction>;
