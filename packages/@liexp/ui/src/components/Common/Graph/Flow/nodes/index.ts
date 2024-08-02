/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  Actor,
  Events,
  Group,
  Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import { type BuiltInNode, type NodeTypes } from "@xyflow/react";
import { ActorNode, type ActorNodeType } from "./ActorNode.js";
import { EventNode, type EventNodeType } from "./EventNode.js";
import { GroupBoxNode, type GroupBoxNodeType } from "./GroupBoxNode.js";
import { GroupNode, type GroupNodeType } from "./GroupNode.js";
import { KeywordNode, type KeywordNodeType } from "./KeywordNode.js";

export const nodeTypes: NodeTypes = {
  // common nodes
  [Events.Event.name]: EventNode,
  [Actor.Actor.name]: ActorNode,
  [Group.Group.name]: GroupNode,
  [Keyword.Keyword.name]: KeywordNode,
  group: GroupBoxNode,
};

export type NodeType =
  | BuiltInNode
  | GroupBoxNodeType
  | ActorNodeType
  | GroupNodeType
  | KeywordNodeType
  | EventNodeType;
