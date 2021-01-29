import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { BaseFrontmatter } from "../Common/BaseFrontmatter";
import { ByGroupOrActor } from "../Common/ByGroupOrActor";
import { Impact } from "../Common/Impact";
import { ImageFileNode } from "../Image";
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
    images: t.array(ImageFileNode),
    impact: Impact,
  },
  PROJECT_IMPACT
);

export type ProjectImpact = t.TypeOf<typeof ProjectImpact>;
