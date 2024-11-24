import * as t from "io-ts";
import { ACTORS } from "./Actor.js";
import { AREAS } from "./Area.js";
import { EVENTS } from "./Events/index.js";
import { GROUPS } from "./Group.js";
import { KEYWORDS } from "./Keyword.js";
import { LINKS } from "./Link.js";
import { MEDIA } from "./Media/index.js";

export const ResourcesNames = t.union(
  [
    t.literal("index"),
    EVENTS,
    KEYWORDS,
    ACTORS,
    GROUPS,
    t.literal("stories"),
    AREAS,
    t.literal("projects"),
    MEDIA,
    t.literal("profile"),
    LINKS,
    t.literal("events/suggestions"),
  ],
  "ResourcesNames",
);

export type ResourcesNames = t.TypeOf<typeof ResourcesNames>;
