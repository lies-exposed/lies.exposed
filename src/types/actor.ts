import * as t from "io-ts"

export const ActorPageContentFileNode = t.interface(
  {
    childMarkdownRemark: t.interface(
      {
        frontmatter: t.interface({
          title: t.string,
          path: t.string,
          date: t.string,
          avatar: t.string,
        }),
        html: t.string,
      },
      "ActorPageContentFileNodeMarkdownRemark"
    ),
  },
  "ActorPageContentFileNode"
)

export type ActorPageContentFileNode = t.TypeOf<typeof ActorPageContentFileNode>

export const ActorFrontmatter = t.interface(
  {
    title: t.string,
    username: t.string,
    cover: t.union([t.null, t.string]),
    avatar: t.string,
  },
  "ActorFrontmatter"
)
export type ActorFrontmatter = t.TypeOf<typeof ActorFrontmatter>

export const ActorFileNode = t.interface(
  {
    id: t.string,
    relativeDirectory: t.string,
    childMarkdownRemark: t.interface(
      {
        frontmatter: ActorFrontmatter,
      },
      "ActorFileNodeChildMarkdownRemark"
    ),
  },
  "ActorFileNode"
)

export type ActorFileNode = t.TypeOf<typeof ActorFileNode>
