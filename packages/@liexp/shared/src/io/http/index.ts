// can use ts paths now
import * as t from "io-ts";
import * as Actor from "./Actor.js";
import * as Area from "./Area.js";
import * as Common from "./Common/index.js";
import * as Error from "./Error/index.js";
import * as EventSuggestion from "./EventSuggestion.js";
import * as Events from "./Events/index.js";
import * as Group from "./Group.js";
import * as GroupMember from "./GroupMember.js";
import * as Keyword from "./Keyword.js";
import * as Link from "./Link.js";
import * as Media from "./Media.js";
import * as Network from "./Network.js";
import * as Page from "./Page.js";
import * as Project from "./Project.js";
import * as ProjectImage from "./ProjectImage.js";
import * as Query from "./Query/index.js";
import * as Stats from "./Stats.js";
import * as Story from "./Story.js";
import * as Topic from "./Topic.js";
import * as User from "./User.js";
import * as Video from "./Video.js";

export const ResourcesNames = t.keyof(
  {
    index: null,
    events: null,
    keywords: null,
    actors: null,
    groups: null,
    stories: null,
    areas: null,
    projects: null,
    media: null,
    profile: null,
    "events/suggestions": null,
  },
  "ResourcesNames",
);

export type ResourcesNames = t.TypeOf<typeof ResourcesNames>;

export {
  Actor,
  Area,
  Story,
  Common,
  Link,
  Error,
  Events,
  Keyword,
  Group,
  GroupMember,
  Media,
  Project,
  ProjectImage,
  Video,
  User,
  Page,
  Query,
  Stats,
  Network,
  Topic,
  EventSuggestion,
};
