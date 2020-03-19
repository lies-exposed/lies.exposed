import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const TopicPageContentFileNodeFrontmatter = t.type(
  {
    title: t.string,
    date: DateFromISOString,
    slug: t.string,
    color: optionFromNullable(t.string),
  },
  "TopicPageContentFileNodeFrontmatter"
)

export type TopicPageContentFileNodeFrontmatter = t.TypeOf<
  typeof TopicPageContentFileNodeFrontmatter
>

export const TopicPageContentFileNode = t.type(
  {
    id: t.string,
    childMarkdownRemark: t.type(
      {
        frontmatter: TopicPageContentFileNodeFrontmatter,
        htmlAst: t.object,
      },
      "TopicPageContentFileNodeMarkdownRemark"
    ),
  },
  "TopicPageContentFileNode"
)

export type TopicPageContentFileNode = t.TypeOf<typeof TopicPageContentFileNode>

export const TopicFileNodeFrontmatter = t.type(
  {
    title: t.string,
    slug: t.string,
    cover: optionFromNullable(t.string),
    color: t.string,
  },
  "TopicFileNodeFrontmatter"
)

export const TopicFileNode = t.interface(
  {
    relativeDirectory: t.string,
    childMarkdownRemark: t.interface({
      id: t.string,
      frontmatter: TopicFileNodeFrontmatter,
    }),
  },
  "TopicFileNode"
)

export type TopicFileNode = t.TypeOf<typeof TopicFileNode>

export const TopicData = t.interface(
  {
    id: t.string,
    label: t.string,
    slug: t.string,
    color: t.string,
    selected: t.boolean,
  },
  "TopicData"
)

export type TopicData = t.TypeOf<typeof TopicData>

export const TopicPoint = t.interface(
  {
    x: t.number,
    y: t.number,
    data: TopicData,
  },
  "TopicPoint"
)

export type TopicPoint = t.TypeOf<typeof TopicPoint>
