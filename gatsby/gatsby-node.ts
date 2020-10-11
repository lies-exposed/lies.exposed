/* eslint-disable no-restricted-imports */
import fs from "fs"
import path from "path"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import {
  CreatePagesArgs,
  CreateSchemaCustomizationArgs,
  SourceNodesArgs,
  Node,
  CreateNodeArgs,
  CreateResolversArgs,
  // CreateWebpackConfigArgs,
} from "gatsby"
import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
// import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"
import { ActorFrontmatter } from "../src/models/actor"
import { AreaFrontmatter } from "../src/models/area"
import { ArticleFrontmatter } from "../src/models/article"
import { EventFrontmatter } from "../src/models/event"
import { GroupMarkdownRemark, GroupFrontmatter } from "../src/models/group"
import { PageFrontmatter } from "../src/models/page"
import { TopicFrontmatter } from "../src/models/topic"

const group = <A>(S: Eq.Eq<A>): ((as: A[]) => A[][]) => {
  return A.chop((as) => {
    const { init, rest } = A.spanLeft((a: A) => S.equals(a, as[0]))(as)
    return [init, rest]
  })
}

const createArticlePages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const BlogPostTemplate = path.resolve(
    `src/templates/ArticleTemplate/ArticleTemplate.tsx`
  )

  const result = await graphql<{
    articles: { nodes: ArticleFrontmatter[] }
  }>(`
    {
      articles: allArticleFrontmatter {
        nodes {
          uuid
          title
          path
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for article pages`)
    return
  }

  result.data.articles.nodes.forEach((node) => {
    const context = {
      articleUUID: node.uuid,
    }

    reporter.info(
      `article page [${node.title}] context: ${JSON.stringify(
        context,
        null,
        4
      )}`
    )

    createPage({
      path: `/blog/${node.path}`,
      component: BlogPostTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createGroupPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const groupTemplate = path.resolve(
    `src/templates/GroupTemplate/GroupTemplate.tsx`
  )

  const result = await graphql<{
    groups: { nodes: Array<{ childMarkdownRemark: GroupMarkdownRemark }> }
  }>(`
    {
      groups: allFile(filter: { sourceInstanceName: { eq: "groups" } }) {
        nodes {
          childMarkdownRemark {
            frontmatter {
              ... on GroupFrontmatter {
                uuid
                name
                members {
                  uuid
                }
              }
            }
          }
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(
      `Error while running createTimelinePages query.`,
      result.errors
    )
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for group pages`)
    return
  }

  const nodes = result.data.groups.nodes

  nodes.forEach((node) => {
    const groupUUID = node.childMarkdownRemark.frontmatter.uuid
    const nodePath = `/groups/${groupUUID}`

    const context = {
      group: groupUUID,
      members: (node.childMarkdownRemark.frontmatter.members as any).map(
        (m: any) => m.uuid
      ),
    }

    reporter.info(
      `Group template [${groupUUID}], context: ${JSON.stringify(
        context,
        null,
        4
      )}`
    )

    createPage({
      path: nodePath,
      component: groupTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createActorPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const actorTemplate = path.resolve(
    `src/templates/ActorTemplate/ActorTemplate.tsx`
  )

  const result = await graphql<{ actors: { nodes: Array<{ name: string }> } }>(`
    {
      actors: allFile(filter: { sourceInstanceName: { eq: "actors" } }) {
        nodes {
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createActorPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for actor pages`)
    return
  }

  const nodes = result.data.actors.nodes
  nodes.forEach((node) => {
    const actorUUID = node.name
    const nodePath = `/actors/${actorUUID}`

    const context = {
      actorUUID,
    }

    reporter.info(
      `Actor page [${nodePath}] context: ${JSON.stringify(context, null, 4)}`
    )

    createPage({
      path: nodePath,
      component: actorTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createEventPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const postTemplate = path.resolve(`src/templates/EventTemplate.tsx`)

  const result = await graphql<{ events: { nodes: Array<{ name: string }> } }>(`
    {
      events: allFile(filter: { sourceInstanceName: { eq: "events" } }) {
        nodes {
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createEventPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for actor pages`)
    return
  }

  const nodes = result.data.events.nodes
  nodes.forEach((node) => {
    const eventUUID = node.name
    const nodePath = `/events/${eventUUID}`

    const context = {
      eventUUID,
    }

    reporter.info(
      `Event page [${nodePath}] context: ${JSON.stringify(context, null, 4)}`
    )

    createPage({
      path: nodePath,
      component: postTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

// const createNetworkPages = async ({
//   actions,
//   graphql,
//   reporter,
// }: CreatePagesArgs): Promise<void> => {
//   const { createPage } = actions

//   const result = await graphql<{
//     networks: { nodes: Array<{ name: string }> }
//   }>(`
//     {
//       networks: allDirectory(
//         filter: { relativeDirectory: { glob: "networks" } }
//       ) {
//         nodes {
//           name
//         }
//       }
//     }
//   `)

//   // Handle errors
//   if (result.errors !== undefined) {
//     reporter.panicOnBuild(`Error while running GraphQL allNetworks query.`)
//     return
//   }

//   const component = path.resolve(
//     `src/templates/NetworkTemplate/NetworkTemplate.tsx`
//   )

//   if (result.data === undefined) {
//     reporter.panicOnBuild(`No data for networks pages`)
//     return
//   }

//   result.data.networks.nodes.forEach(({ name }) => {
//     const relativeDirectory = `events/networks/${name}`
//     const eventsRelativeDirectory = `events/networks/${name}/*`
//     const imagesRelativeDirectory = `events/networks/${name}/*/images`

//     const context = {
//       relativeDirectory,
//       eventsRelativeDirectory,
//       imagesRelativeDirectory,
//     }
//     reporter.info(
//       `network page [${name}] context: ${JSON.stringify(context, null, 4)}`
//     )

//     createPage({
//       path: `/networks/${name}`,
//       component,
//       // additional data can be passed via context
//       context,
//     })
//   })
// }

const createTopicPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const topicTemplate = path.resolve(
    `src/templates/TopicTemplate/TopicTemplate.tsx`
  )

  const result = await graphql<{ topics: { nodes: Array<{ name: string }> } }>(`
    {
      topics: allFile(filter: { sourceInstanceName: { eq: "topics" } }) {
        nodes {
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createTopicPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for topics pages`)
    return
  }

  const nodes = result.data.topics.nodes

  nodes.forEach((node) => {
    const nodePath = `/topics/${node.name}`

    const context = {
      topic: node.name,
    }

    reporter.info(
      `Topic [${node.name}] context: ${JSON.stringify(context, null, 4)}`
    )
    reporter.info(`Building to path: ${nodePath}`)

    createPage({
      path: nodePath,
      component: topicTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createAreasPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const areaTemplate = path.resolve(`src/templates/AreaTemplate.tsx`)

  const result = await graphql<{
    areas: {
      nodes: Array<{
        name: string
        childMarkdownRemark: { frontmatter: AreaFrontmatter }
      }>
    }
  }>(`
    {
      areas: allFile(filter: { sourceInstanceName: { eq: "areas" } }) {
        nodes {
          name
          childMarkdownRemark {
            frontmatter {
              ... on AreaFrontmatter {
                groups {
                  uuid
                }
                topics {
                  uuid
                }
              }
            }
          }
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createTopicPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for topics pages`)
    return
  }

  const nodes = result.data.areas.nodes

  nodes.forEach((node) => {
    const nodePath = `/areas/${node.name}`

    const context = {
      areaUUID: node.name,
      groupUUIDs: node.childMarkdownRemark.frontmatter.groups.map(
        (g) => g.uuid
      ),
      topicUUIDs: node.childMarkdownRemark.frontmatter.topics.map(
        (t) => t.uuid
      ),
    }

    reporter.info(`Area context: ${JSON.stringify(context, null, 4)}`)
    reporter.info(`Building to path: ${nodePath}`)

    createPage({
      path: nodePath,
      component: areaTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

export const createPages = async (options: CreatePagesArgs): Promise<void> => {
  await createArticlePages(options)
  await createActorPages(options)
  await createGroupPages(options)
  await createTopicPages(options)
  await createEventPages(options)
  await createAreasPages(options)
  // await createNetworkPages(options)
}

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
} = GroupFrontmatter.type.props
const GroupF = t.type({
  ...GroupFrontmatterProps,
  avatar: optionFromNullable(t.string),
  members: optionFromNullable(t.array(t.string)),
})
const {
  groups,
  topics,
  actors,
  images,
  ...EventFrontmatterProps
} = EventFrontmatter.type.props

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
          "EventFrontmatter",
          "TopicFrontmatter",
          "AreaFrontmatter",
          "PageFrontmatter",
          "MarkdownRemarkFrontmatter",
        ],
        resolveType: async (source) => {
          if (E.isRight(ActorF.decode(source))) {
            return "ActorFrontmatter"
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
            return "EventFrontmatter"
          }

          if (E.isRight(PageFrontmatter.decode(source))) {
            return "PageFrontmatter"
          }

          // eslint-disable-next-line no-console
          console.log(source)

          return "MarkdownRemarkFrontmatter"
        },
      }),
    ],
    { name: "default-site-plugin" }
  )
}

export const createResolvers = ({
  createResolvers,
}: CreateResolversArgs): void => {
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
      avatar: {
        type: "File",
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
    EventFrontmatter: {
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
        type: "[ImageWithDescription!]",
        resolve: async (source: any, args: any, context: any) => {
          const sourceImages: Array<{
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
            A.map((image: any) => ({
              description: pipe(
                images,
                A.findFirst((i) => i.image === image.absolutePath),
                O.mapNullable((i) => i.description),
                O.toUndefined
              ),
              image: image,
            }))
          )
        },
      },
    },
  }
  createResolvers(resolvers)
}

export const sourceNodes = ({
  boundActionCreators,
  getNodesByType,
}: SourceNodesArgs): void => {
  const { createNodeField } = boundActionCreators

  pipe(
    getNodesByType("MarkdownRemark"),
    group(
      Eq.contramap<string, Node>((n) => (n.fields as any).collection as string)(
        Eq.eqString
      )
    ),
    A.map((n) => {
      const firstNode = A.head(n)
      if (O.isSome(firstNode)) {
        const collection = (firstNode.value as any).fields.collection
        switch (collection) {
          case "events": {
            n.forEach((e) => {
              createNodeField({
                node: e,
                name: `actors`,
                value: (e.frontmatter as any).actors ?? [],
              })

              createNodeField({
                node: e,
                name: `groups`,
                value: (e.frontmatter as any).groups ?? [],
              })

              createNodeField({
                node: e,
                name: `topics`,
                value: (e.frontmatter as any).topics ?? [],
              })
            })
            break
          }

          case "groups": {
            n.forEach((e) => {
              createNodeField({
                node: e,
                name: `members`,
                value: (e.frontmatter as any).members ?? [],
              })
            })
            break
          }

          case "areas": {
            n.forEach((e) => {
              createNodeField({
                node: e,
                name: `topics`,
                value: (e.frontmatter as any).topics ?? [],
              })

              createNodeField({
                node: e,
                name: `groups`,
                value: (e.frontmatter as any).groups ?? [],
              })
            })
            break
          }
        }
      }
    })
  )
}

type Collection =
  | "actors"
  | "articles"
  | "groups"
  | "events"
  | "pages"
  | "topics"
  | "areas"

const collectionToTypeMap: Record<Collection, string> = {
  actors: "ActorFrontmatter",
  articles: "ArticleFrontmatter",
  groups: "GroupFrontmatter",
  events: "EventFrontmatter",
  pages: "PageFrontmatter",
  topics: "TopicFrontmatter",
  areas: "AreaFrontmatter",
}

export const onCreateNode = ({
  node,
  actions,
  getNode,
  createNodeId,
}: CreateNodeArgs): void => {
  const { createNodeField, createNode } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const collection = getNode(node.parent).sourceInstanceName as Collection

    const frontmatter = node.frontmatter as any
    createNodeField({
      name: `collection`,
      node,
      value: collection,
    })

    switch (collection) {
      case "events": {
        createNodeField({
          name: "actors",
          node,
          value: frontmatter.actors ?? [],
        })

        createNodeField({
          name: "groups",
          node,
          value: frontmatter.groups ?? [],
        })

        createNodeField({
          name: "topics",
          node,
          value: frontmatter.topics ?? [],
        })
        break
      }

      case "groups": {
        createNodeField({
          name: "members",
          node,
          value: frontmatter.members ?? [],
        })
        break
      }

      case "areas": {
        createNodeField({
          name: "topics",
          node,
          value: frontmatter.topics ?? [],
        })
        break
      }
    }

    const type = collectionToTypeMap[collection]
    const nodeId = createNodeId(`${type}-${node.id}`)

    createNode({
      ...frontmatter,
      id: nodeId,
      parent: node.id,
      internal: {
        type,
        contentDigest: node.internal.contentDigest,
      },
    })
  }
}

// export const onCreateWebpackConfig = ({
//   actions,
// }: CreateWebpackConfigArgs): void => {
//   const analyserPlugin = new BundleAnalyzerPlugin({
//     analyzerMode: "json",
//     generateStatsFile: true,
//   })
//   actions.setWebpackConfig({
//     plugins: [analyserPlugin],
//   })
// }
