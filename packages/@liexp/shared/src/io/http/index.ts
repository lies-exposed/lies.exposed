// can use ts paths now
import * as t from "io-ts";
import * as Actor from "./Actor";
import * as Area from "./Area";
import * as Article from "./Article";
import * as Common from "./Common";
import * as Error from "./Error";
import * as EventSuggestion from './EventSuggestion'
import * as Events from "./Events";
import * as Group from "./Group";
import * as GroupMember from "./GroupMember";
import * as Keyword from "./Keyword";
import * as Link from "./Link";
import * as Media from "./Media";
import * as Network from "./Networks";
import * as Page from "./Page";
import * as Project from "./Project";
import * as ProjectImage from "./ProjectImage";
import * as Query from "./Query";
import * as Stats from './Stats';
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
    articles: null,
    areas: null,
    projects: null,
  },
  "ResourcesNames"
);

export type ResourcesNames = t.TypeOf<typeof ResourcesNames>;

export {
  Actor,
  Area,
  Article,
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
  EventSuggestion
};
