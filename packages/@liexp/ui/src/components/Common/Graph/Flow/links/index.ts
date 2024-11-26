import {
  Actor,
  Keyword,
  Group,
  Events,
} from "@liexp/shared/lib/io/http/index.js";
import { type Edge } from "@xyflow/react";
import { ActorLink, type ActorLinkType } from "./ActorLink.js";

export const edgeTypes = {
  [Actor.Actor.name]: ActorLink,
  [Keyword.Keyword.name]: ActorLink,
  [Group.Group.name]: ActorLink,
  [Events.Event.name]: ActorLink,
};

export type EdgeType =
  | ActorLinkType
  | Edge<{ color: string }, typeof Keyword.Keyword.name>;
