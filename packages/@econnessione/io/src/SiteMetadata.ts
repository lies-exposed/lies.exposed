import * as t from "io-ts"

export const SiteMetadata = t.strict(
  {
    title: t.string,
    github: t.interface(
      {
        user: t.string,
        repo: t.string,
        link: t.string,
      },
      "GithubMetadata"
    ),
    slack: t.interface(
      {
        team: t.string,
      },
      "SlackMetadata"
    ),
  },
  "SiteMetadata"
)

export type SiteMetadata = t.TypeOf<typeof SiteMetadata>