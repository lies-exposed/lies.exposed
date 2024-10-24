import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { BaseProps } from "../../Common/BaseProps.js";
import { BySubjectId } from "../../Common/BySubject.js";
import { Impact } from "../../Common/Impact.js";

export const PROJECT_IMPACT = "ProjectImpact";

export const ProjectImpact = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    type: t.literal(PROJECT_IMPACT),
    project: t.string,
    date: DateFromISOString,
    approvedBy: t.array(BySubjectId),
    executedBy: t.array(BySubjectId),
    media: t.array(t.string),
    impact: Impact,
  },
  PROJECT_IMPACT,
);

export type ProjectImpact = t.TypeOf<typeof ProjectImpact>;
