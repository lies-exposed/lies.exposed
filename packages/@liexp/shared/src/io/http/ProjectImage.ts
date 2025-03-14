import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { MediaType } from "./Media/MediaType.js";

export const THEORY_KIND = Schema.Literal("THEORY");
export const PRACTICE_KIND = Schema.Literal("PRACTICE");

export const Kind = Schema.Union(THEORY_KIND, PRACTICE_KIND);
export type Kind = typeof Kind.Type;

export const ProjectImage = Schema.Struct({
  ...BaseProps.fields,
  kind: Kind,
  type: MediaType,
  location: Schema.String,
  description: Schema.String,
  projectId: Schema.String,
}).annotations({
  title: "ProjectImage",
});

export type ProjectImage = typeof ProjectImage.Type;
