import { Schema } from "effect";
import { Area } from "./Area.js";
import { BaseProps } from "./Common/BaseProps.js";
import { Color } from "./Common/Color.js";
import { Media } from "./Media/Media.js";

export const PROJECT_FRONTMATTER = Schema.Literal("ProjectFrontmatter");
export type PROJECT_FRONTMATTER = typeof PROJECT_FRONTMATTER.Type;

export const Project = Schema.Struct({
  ...BaseProps.fields,
  name: Schema.String,
  color: Color,
  areas: Schema.Array(Area),
  media: Schema.Array(Media),
  startDate: Schema.DateFromString,
  endDate: Schema.Union(Schema.DateFromString, Schema.Undefined),
  body: Schema.String,
}).annotations({ title: "Project" });

export type Project = typeof Project.Type;
