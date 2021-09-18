// can use ts paths now
// eslint-disable-next-line import/first
import * as t from "io-ts";

export const ResourcesNames = t.keyof(
  {
    events: null,
    topics: null,
    actors: null,
    groups: null,
    articles: null,
    areas: null,
    projects: null,
  },
  "ResourcesNames"
);

export type ResourcesNames = t.TypeOf<typeof ResourcesNames>;

export * as Actor from "./Actor";
export * as Area from "./Area";
export * as Article from "./Article";
export * as Common from "./Common";
export * as Link from "./Link";
export * as Error from "./Error";
export * as Events from "./Events";
export * as Group from "./Group";
export * as GroupMember from "./GroupMember";
export * as Image from "./Image";
export * as Network from "./Networks";
export * as Page from "./Page";
export * as Project from "./Project";
export * as ProjectImage from "./ProjectImage";
export * as Query from "./Query";
export * as Topic from "./Topic";
export * as Transaction from "./Transaction";
export * as User from "./User";
export * as Video from "./Video";
