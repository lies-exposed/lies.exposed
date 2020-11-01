import * as path from 'path'
import { ImageSource } from '@models/Image'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { pipe } from "fp-ts/lib/pipeable"
import { CreateResolversArgs } from "gatsby"

type GQLImageSource = Omit<ImageSource, 'description'> & { description?: string}

const resolveImageSource = async (source: any, args: any, context: any): Promise<GQLImageSource[] | null> => {
    const sourceImages: Array<{
      author: string
      description?: string
      image: string
    }> = source.images ?? []
    const images = pipe(
      sourceImages,
      A.map((i) => ({
        ...i,
        image: path.join(process.cwd(), i.image.replace("../../", "/")),
      }))
    )

    const imagesPaths = images.map((i) => i.image)

    if (A.isEmpty(imagesPaths)) {
      return null
    }

    const results = await context.nodeModel.runQuery({
      type: "File",
      query: {
        filter: { absolutePath: { in: imagesPaths } },
      },
      firstOnly: false,
    })

    if (results === null) {
      return null
    }

    return pipe(
      results,
      A.map((result: any) =>
        pipe(
          images,
          A.findFirst((i) => i.image === result.absolutePath),
          O.map(image => ({
            ...image,
            image: result
          }))
        )
      ),
      A.compact
    )
  }

export const createResolvers = ({
  createResolvers,
}:CreateResolversArgs): void => {
  const resolvers = {
    ArticleFrontmatter: {
      featuredImage: {
        type: "File!",
      },
      date: {
        type: "Date!",
      },
    },
    ActorFrontmatter: {
      date: {
        type: "Date!",
      },
    },
    GroupFrontmatter: {
      uuid: {
        type: "String!",
        resolve: (source: any) => source.uuid,
      },
      avatar: {
        type: "File!",
      },
      members: {
        type: "[ActorFrontmatter!]",
        resolve: async (source: any, args: any, context: any) => {
          const memberIds = source.members ?? []
          return context.nodeModel
            .getAllNodes({
              type: "ActorFrontmatter",
            })
            .filter((m: any) => memberIds.includes(m.uuid))
        },
      },
    },
    AreaFrontmatter: {
      groups: {
        type: "[GroupFrontmatter!]",
        resolve: async (source: any, args: any, context: any) => {
          const groupIds = source.groups ?? []
          return context.nodeModel
            .getAllNodes({
              type: "GroupFrontmatter",
            })
            .filter((m: any) => groupIds.includes(m.uuid))
        },
      },
      topics: {
        type: "[TopicFrontmatter!]",
        resolve: async (source: any, args: any, context: any) => {
          const topicIds = source.topics ?? []
          return context.nodeModel
            .getAllNodes({
              type: "TopicFrontmatter",
            })
            .filter((m: any) => topicIds.includes(m.uuid))
        },
      },
    },
    ProjectFrontmatter: {
      images: {
        type: "[ImageSource!]",
        resolve: resolveImageSource
      },
    },
    UncategorizedEventFrontmatter: {
      actors: {
        type: "[ActorFrontmatter!]",
        resolve: async (source: any, args: any, context: any) => {
          const actorIds = source.actors ?? []
          return context.nodeModel
            .getAllNodes({
              type: "ActorFrontmatter",
            })
            .filter((m: any) => actorIds.includes(m.uuid))
        },
      },
      groups: {
        type: "[GroupFrontmatter!]",
        resolve: async (source: any, args: any, context: any) => {
          const groupIds = source.groups ?? []
          return context.nodeModel
            .getAllNodes({
              type: "GroupFrontmatter",
            })
            .filter((m: any) => groupIds.includes(m.uuid))
        },
      },
      topics: {
        type: "[TopicFrontmatter!]",
        resolve: async (source: any, args: any, context: any) => {
          const topicIds = source.topics ?? []
          return context.nodeModel
            .getAllNodes({
              type: "TopicFrontmatter",
            })
            .filter((m: any) => topicIds.includes(m.uuid))
        },
      },
      images: {
        type: "[ImageSource!]",
        resolve: resolveImageSource
      },
    }
  }
  createResolvers(resolvers)
}
