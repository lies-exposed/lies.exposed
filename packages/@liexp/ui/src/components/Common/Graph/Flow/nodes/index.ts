import {
  Actor,
  Events,
  Group,
  Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import { ActorNode } from "./ActorNode.js";
import { EventNode } from "./EventNode.js";
import { GroupBoxNode } from './GroupBoxNode.js';
import { GroupNode } from "./GroupNode.js";
import { KeywordNode } from "./KeywordNode.js";

export const nodeTypes = {
  // common nodes
  'group': GroupBoxNode,
  [Events.Event.name]: EventNode,
  [Actor.Actor.name]: ActorNode,
  [Group.Group.name]: GroupNode,
  [Keyword.Keyword.name]: KeywordNode,
};
