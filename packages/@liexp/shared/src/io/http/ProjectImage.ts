import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps.js";
import { MediaType } from "./Media/MediaType.js";

export const THEORY_KIND = t.literal("THEORY");
export const PRACTICE_KIND = t.literal("PRACTICE");

export const Kind = t.union([THEORY_KIND, PRACTICE_KIND]);
export type Kind = t.TypeOf<typeof Kind>;

export const ProjectImage = t.strict(
  {
    ...BaseProps.type.props,
    kind: Kind,
    type: MediaType,
    location: t.string,
    description: t.string,
    projectId: t.string,
  },
  "ProjectImage",
);

export type ProjectImage = t.TypeOf<typeof ProjectImage>;
