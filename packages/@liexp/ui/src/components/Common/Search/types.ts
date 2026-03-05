import {
  type Actor,
  type Area,
  type Events,
  type Group,
  type Keyword,
  type Link,
  type Media,
} from "@liexp/io/lib/http/index.js";
import * as React from "react";
import { Icons } from "../../mui/index.js";
import {
  ActorIcon,
  AreaIcon,
  GroupIcon,
  HashtagIcon,
  LinkIcon,
  MediaIcon,
} from "../Icons/FAIcon.js";

// ---------------------------------------------------------------------------
// Resource type
// ---------------------------------------------------------------------------

export type SearchResourceType =
  | "actor"
  | "group"
  | "keyword"
  | "area"
  | "event"
  | "link"
  | "media";

export interface ResourceTypeOption {
  value: SearchResourceType;
  label: string;
  icon: React.ReactNode;
}

export const RESOURCE_TYPES: ResourceTypeOption[] = [
  { value: "actor", label: "Actors", icon: React.createElement(ActorIcon) },
  { value: "group", label: "Groups", icon: React.createElement(GroupIcon) },
  {
    value: "keyword",
    label: "Keywords",
    icon: React.createElement(HashtagIcon),
  },
  { value: "area", label: "Areas", icon: React.createElement(AreaIcon) },
  {
    value: "event",
    label: "Events",
    icon: React.createElement(Icons.Assignment, { fontSize: "small" }),
  },
  { value: "link", label: "Links", icon: React.createElement(LinkIcon) },
  { value: "media", label: "Media", icon: React.createElement(MediaIcon) },
];

// ---------------------------------------------------------------------------
// Search result union
// ---------------------------------------------------------------------------

export type SearchResult =
  | { kind: "actor"; item: Actor.Actor }
  | { kind: "group"; item: Group.Group }
  | { kind: "keyword"; item: Keyword.Keyword }
  | { kind: "area"; item: Area.Area }
  | { kind: "event"; item: Events.Event }
  | { kind: "link"; item: Link.Link }
  | { kind: "media"; item: Media.Media };
