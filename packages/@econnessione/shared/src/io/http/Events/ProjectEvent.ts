import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseFrontmatter } from "../Common/BaseFrontmatter";
import { ByGroupOrActor } from "../Common/ByGroupOrActor";
import { Impact } from "../Common/Impact";
import { markdownRemark } from "../Common/Markdown";
import { Project } from "../Project";

export const PROJECT_IMPACT = "ProjectImpact";

export const ProjectImpact = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    type: t.literal(PROJECT_IMPACT),
    project: Project,
    date: DateFromISOString,
    approvedBy: t.array(ByGroupOrActor),
    executedBy: t.array(ByGroupOrActor),
    images: t.array(t.string),
    impact: Impact,
  },
  PROJECT_IMPACT
);

export type ProjectImpact = t.TypeOf<typeof ProjectImpact>;

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
