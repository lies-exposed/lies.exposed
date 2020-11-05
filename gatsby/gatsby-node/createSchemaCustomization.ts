/* eslint-disable no-restricted-imports */

import * as fs from "fs"
import * as E from "fp-ts/lib/Either"
import { CreateSchemaCustomizationArgs } from "gatsby"
import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ProjectFrontmatter } from "../../src/models/Project"
import { ActorFrontmatter } from "../../src/models/actor"
import { AreaFrontmatter } from "../../src/models/area"
import { ArticleFrontmatter } from "../../src/models/article"
import { Uncategorized } from "../../src/models/events/UncategorizedEvent"
import { GroupFrontmatter } from "../../src/models/group"
import { PageFrontmatter } from "../../src/models/page"
import { TopicFrontmatter } from "../../src/models/topic"
import { MD_FRONTMATTER_TYPE } from "./consts"

const {
  featuredImage,
  ...ArticleFrontmatterProps
} = ArticleFrontmatter.type.props
const ArticleF = t.strict(
  {
    ...ArticleFrontmatterProps,
    featuredImage: t.string,
  },
  "ArticleF"
)

const { avatar, ...ActorFrontmatterProps } = ActorFrontmatter.type.props
const ActorF = t.type({
  ...ActorFrontmatterProps,
  avatar: optionFromNullable(t.string),
})

const {
  avatar: _groupAvatar,
  members,
  ...GroupFrontmatterProps
} = GroupFrontmatter.type.type.props

const GroupF = t.type(
  {
    ...GroupFrontmatterProps,
    avatar: optionFromNullable(t.string),
    members: optionFromNullable(t.array(t.string)),
  },
  "GroupF"
)

const {
  groups,
  topics,
  actors,
  images,
  ...EventFrontmatterProps
} = Uncategorized.type.props

const EventF = t.type({
  ...EventFrontmatterProps,
  groups: optionFromNullable(t.array(t.string)),
  topics: optionFromNullable(t.array(t.string)),
  actors: optionFromNullable(t.array(t.string)),
  images: optionFromNullable(
    t.array(
      t.type({
        description: t.string,
        image: t.string,
      })
    )
  ),
})

const { groups: _groups, topics: _topics, ...Area } = AreaFrontmatter.type.props
const AreaF = t.strict({
  ...Area,
  groups: t.array(t.string),
  topics: t.array(t.string),
})

const { images: _images, ...Project } = ProjectFrontmatter.type.props
const ProjectF = t.strict(
  {
    ...Project,
    images: optionFromNullable(
      t.array(
        t.type({
          description: t.string,
          image: t.string,
        })
      )
    ),
  },
  "ProjectF"
)

export const createSchemaCustomization = async ({
  actions,
  schema,
}: CreateSchemaCustomizationArgs): Promise<void> => {
  const { createTypes } = actions
  const typeDefs = fs.readFileSync(`${__dirname}/types-def.gql`, {
    encoding: "utf-8",
  })

  createTypes(
    [
      typeDefs as any,
      schema.buildUnionType({
        name: "Frontmatter",
        types: [
          "ArticleFrontmatter",
          "ActorFrontmatter",
          "GroupFrontmatter",
          "UncategorizedEventFrontmatter",
          "TopicFrontmatter",
          "AreaFrontmatter",
          "PageFrontmatter",
          "ProjectFrontmatter",
          MD_FRONTMATTER_TYPE,
        ],
        resolveType: async (source, context, info) => {
          // todo: use info.rootValue.path instead decoding each source

          if (E.isRight(ActorF.decode(source))) {
            return "ActorFrontmatter"
          }

          if (E.isRight(ProjectF.decode(source))) {
            return "ProjectFrontmatter"
          }

          if (E.isRight(GroupF.decode(source))) {
            return "GroupFrontmatter"
          }

          if (E.isRight(TopicFrontmatter.decode(source))) {
            return "TopicFrontmatter"
          }

          if (E.isRight(ArticleF.decode(source))) {
            return "ArticleFrontmatter"
          }

          if (E.isRight(AreaF.decode(source))) {
            return "AreaFrontmatter"
          }

          if (E.isRight(EventF.decode(source))) {
            return "UncategorizedEventFrontmatter"
          }

          if (E.isRight(PageFrontmatter.decode(source))) {
            return "PageFrontmatter"
          }

          // eslint-disable-next-line no-console
          console.log(source)

          return MD_FRONTMATTER_TYPE
        },
      }),
    ],
    { name: "default-site-plugin" }
  )
}
