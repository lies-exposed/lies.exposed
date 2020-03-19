import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const ActorPageContentFileNodeFrontmatter = t.type(
  {
    fullName: t.string,
    date: DateFromISOString,
    avatar: optionFromNullable(t.string),
    username: t.string,
    color: optionFromNullable(t.string),
    cover: optionFromNullable(t.interface({ url: t.string })),
  },
  "ActorPageContentFileNodeFrontmatter"
)

export type ActorPageContentFileNodeFrontmatter = t.TypeOf<
  typeof ActorPageContentFileNodeFrontmatter
>

export const ActorPageContentFileNode = t.type(
  {
    id: t.string,
    childMarkdownRemark: t.type(
      {
        id: t.string,
        frontmatter: ActorPageContentFileNodeFrontmatter,
        htmlAst: t.object,
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
    date: t.string,
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
        id: t.string,
        frontmatter: ActorFrontmatter,
      },
      "ActorFileNodeChildMarkdownRemark"
    ),
  },
  "ActorFileNode"
)

export type ActorFileNode = t.TypeOf<typeof ActorFileNode>
