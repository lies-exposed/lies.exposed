import { Actor, type Keyword } from "@liexp/shared/lib/io/http/index.js";
import { type Edge } from "@xyflow/react";
import { ActorLink, type ActorLinkType } from "./ActorLink";

export const edgeTypes = {
  [Actor.Actor.name]: ActorLink,
};

export type EdgeType =
  | ActorLinkType
  | Edge<{ color: string }, typeof Keyword.Keyword.name>;
