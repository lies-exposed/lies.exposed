import { Schema } from "effect";
import { BaseProps } from "../../Common/BaseProps.js";
import { BySubjectId } from "../../Common/BySubject.js";
import { Impact } from "../../Common/Impact.js";

export const PROJECT_IMPACT = "ProjectImpact";

export const ProjectImpact = Schema.Struct({
  ...BaseProps.fields,
  title: Schema.String,
  type: Schema.Literal(PROJECT_IMPACT),
  project: Schema.String,
  date: Schema.Date,
  approvedBy: Schema.Array(BySubjectId),
  executedBy: Schema.Array(BySubjectId),
  media: Schema.Array(Schema.String),
  impact: Impact,
}).annotations({
  title: PROJECT_IMPACT,
});

export type ProjectImpact = typeof ProjectImpact.Type;
