import * as t from "io-ts";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";

export const THEORY_KIND = t.literal("THEORY");
export const PRACTICE_KIND = t.literal("PRACTICE");

export const Kind = t.union([THEORY_KIND, PRACTICE_KIND]);
export type Kind = t.TypeOf<typeof Kind>

export const ProjectImage = t.strict(
  {
    ...BaseFrontmatter.type.props,
    kind: Kind,
    location: t.string,
    description: t.string,
    projectId: t.string
  },
  "ProjectImage"
);

export type ProjectImage = t.TypeOf<typeof ProjectImage>