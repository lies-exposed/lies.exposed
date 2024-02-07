import * as t from "io-ts";

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
    links: null,
    "events/suggestions": null,
  },
  "ResourcesNames",
);

export type ResourcesNames = t.TypeOf<typeof ResourcesNames>;
