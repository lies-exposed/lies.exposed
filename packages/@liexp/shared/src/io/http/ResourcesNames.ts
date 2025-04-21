import { Schema } from "effect";
import { ACTORS } from "./Actor.js";
import { AREAS } from "./Area.js";
import { EVENTS } from "./Events/index.js";
import { GROUPS } from "./Group.js";
import { KEYWORDS } from "./Keyword.js";
import { LINKS } from "./Link.js";
import { MEDIA } from "./Media/index.js";

export const ResourcesNames = Schema.Union(
  Schema.Literal("index"),
  EVENTS,
  KEYWORDS,
  ACTORS,
  GROUPS,
  Schema.Literal("stories"),
  AREAS,
  Schema.Literal("projects"),
  MEDIA,
  Schema.Literal("profile"),
  LINKS,
  Schema.Literal("events/suggestions"),
).annotations({
  title: "ResourcesNames",
});

export type ResourcesNames = typeof ResourcesNames.Type;
