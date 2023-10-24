// can use ts paths now
import * as t from "io-ts";
import * as Actor from "./Actor";
import * as Area from "./Area";
import * as Common from "./Common";
import * as Error from "./Error";
import * as EventSuggestion from "./EventSuggestion";
import * as Events from "./Events";
import * as Group from "./Group";
import * as GroupMember from "./GroupMember";
import * as Keyword from "./Keyword";
import * as Link from "./Link";
import * as Media from "./Media";
import * as Network from "./Network";
import * as Page from "./Page";
import * as Project from "./Project";
import * as ProjectImage from "./ProjectImage";
import * as Query from "./Query";
import * as Stats from "./Stats";
import * as Story from "./Story";
import * as Topic from "./Topic";
import * as User from "./User";
import * as Video from "./Video";

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
