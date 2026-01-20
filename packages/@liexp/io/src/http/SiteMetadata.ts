import { Schema } from "effect";

export const SiteMetadata = Schema.Struct({
  title: Schema.String,
  github: Schema.Struct({
    user: Schema.String,
    repo: Schema.String,
    link: Schema.String,
  }).annotations({
    title: "GithubMetadata",
  }),
  slack: Schema.Struct({
    team: Schema.String,
  }).annotations({
    title: "SlackMetadata",
  }),
}).annotations({
  title: "SiteMetadata",
});

export type SiteMetadata = typeof SiteMetadata.Type;
