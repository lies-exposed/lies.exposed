/* eslint-disable no-restricted-imports */
import * as Eq from "fp-ts/lib/Eq"
import * as t from "io-ts"
import fs from "fs"
import path from "path"
import * as Ord from "fp-ts/lib/Ord"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import * as E from "fp-ts/lib/Either"
import {
  CreatePagesArgs,
  CreateSchemaCustomizationArgs,
  SourceNodesArgs,
  Node,
  CreateNodeArgs,
  CreateResolversArgs,
  // NodeInput,
} from "gatsby"
import { GroupMarkdownRemark, GroupFrontmatter } from "../src/models/group"
import {
  ArticleMarkdownRemark,
  ArticleFrontmatter,
} from "../src/models/article"
import * as Map from "fp-ts/lib/Map"
import { ActorFrontmatter } from "../src/models/actor"
import { TopicFrontmatter } from "../src/models/topic"
import { pipe } from "fp-ts/lib/pipeable"
import { EventFrontmatter } from "../src/models/event"
import { PageFrontmatter } from "../src/models/page"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

const group = <A>(S: Eq.Eq<A>): ((as: Array<A>) => Array<Array<A>>) => {
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
  const postTemplate = path.resolve(
    `src/templates/ArticleTemplate/ArticleTemplate.tsx`
  )

  const result = await graphql<{
    articles: { nodes: { childMarkdownRemark: ArticleMarkdownRemark }[] }
  }>(`
    {
      articles: allFile(
        sort: {
          order: DESC
          fields: [childMarkdownRemark___frontmatter___date]
        }
        filter: { sourceInstanceName: { eq: "articles" } }
        limit: 1000
      ) {
        nodes {
          childMarkdownRemark {
            frontmatter {
              ... on Article {
                path
                title
              }
            }
          }
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
      filePath: node.childMarkdownRemark.frontmatter.path,
    }

    reporter.info(
      `article page [${
        node.childMarkdownRemark.frontmatter.title
      }] context: ${JSON.stringify(context, null, 4)}`
    )

    createPage({
      path: `/articles/${node.childMarkdownRemark.frontmatter.path}`,
      component: postTemplate,
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
    groups: { nodes: { childMarkdownRemark: GroupMarkdownRemark }[] }
  }>(`
    {
      groups: allFile(filter: { sourceInstanceName: { eq: "groups" } }) {
        nodes {
          childMarkdownRemark {
            frontmatter {
              uuid
              name
              members
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
      members: node.childMarkdownRemark.frontmatter.members,
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

const createActorTimelinePages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const postTemplate = path.resolve(
    `src/templates/ActorTimelineTemplate/ActorTimelineTemplate.tsx`
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
    reporter.panicOnBuild(`Error while running createTimelinePages query.`)
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

const createTopicTimelinePages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const topicTimelineTemplate = path.resolve(
    `src/templates/TopicTimelineTemplate/TopicTimelineTemplate.tsx`
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
    reporter.panicOnBuild(
      `Error while running createNetworkTopicTimelinePages query.`
    )
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
      component: topicTimelineTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

export const createPages = async (options: CreatePagesArgs) => {
  await createGroupPages(options)
  await createArticlePages(options)
  await createActorTimelinePages(options)
  await createTopicTimelinePages(options)
  // await createNetworkPages(options)
}

const { avatar, ...ActorFrontmatterProps } = ActorFrontmatter.props
const ActorF = t.type({
  ...ActorFrontmatterProps,
  avatar: optionFromNullable(t.string),
})

export const createSchemaCustomization = async ({
  actions,
  getNode,
  schema,
}: CreateSchemaCustomizationArgs) => {
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
          "PageFrontmatter",
          "MarkdownRemarkFrontmatter",
        ],
        resolveType: async (source, context, info, abstractType) => {
          console.log({
            source,
            ActorFrontmatter: E.isRight(ActorF.decode(source)),
            GroupFrontmatter: E.isRight(GroupFrontmatter.decode(source)),
            EventFrontmatter: E.isRight(EventFrontmatter.decode(source)),
            TopicFrontmatter: E.isRight(TopicFrontmatter.decode(source)),
            PageFrontmatter: E.isRight(PageFrontmatter.decode(source)),
            ArticleFrontmatter: E.isRight(ArticleFrontmatter.decode(source)),
          })
          if (E.isRight(ActorF.decode(source))) {
            return "ActorFrontmatter"
          }

          if (E.isRight(GroupFrontmatter.decode(source))) {
            return "GroupFrontmatter"
          }

          if (E.isRight(EventFrontmatter.decode(source))) {
            return "EventFrontmatter"
          }

          if (E.isRight(TopicFrontmatter.decode(source))) {
            return "TopicFrontmatter"
          }

          if (E.isRight(PageFrontmatter.decode(source))) {
            return "PageFrontmatter"
          }

          if (E.isRight(ArticleFrontmatter.decode(source))) {
            return "ArticleFrontmatter"
          }

          return "MarkdownRemarkFrontmatter"
        },
      }),
      // schema.buildObjectType({
      //   name: "GroupFrontmatter",
      //   interfaces: ["Node", "Group"],
      //   extensions: {
      //     childOf: ["MarkdownRemark"],
      //   },
      //   fields: {
      //     uuid: { type: "String!" },
      //     name: {
      //       type: "String!",
      //     },
      //     avatar: { type: "File!" },
      //     members: { type: "[String!]" },
      //     date: { type: "Date!" },
      //   },
      // }),
      // schema.buildObjectType({
      //   name: "ActorMarkdown",
      //   interfaces: ["Node"],
      //   fields: {
      //     username: {
      //       type: "String",
      //       resolve: (source, args, context) => {
      //         const parent = context.nodeModel.getNodeById({ id: source.parent })
      //         return parent.frontmatter.username
      //       },
      //     },
      //   },
      // }),
      // schema.buildObjectType({
      //   name: "GroupMarkdown",
      //   interfaces: ["Node", "Group"],
      //   fields: {
      //     id: {
      //       type: "ID!",
      //     },
      //     uuid: {
      //       type: "String!",
      //       resolve: (source, args, context) => {
      //         const parent = context.nodeModel.getNodeById({
      //           id: source.parent,
      //         })
      //         return parent.frontmatter.uuid
      //       },
      //     },
      //     name: {
      //       type: "String!",
      //       resolve: (source, args, context) => {
      //         const parent = context.nodeModel.getNodeById({
      //           id: source.parent,
      //         })
      //         return parent.frontmatter.name
      //       },
      //     },
      //     date: {
      //       type: "Date!",
      //     },
      //     avatar: {
      //       type: "File!",
      //       resolve: (source, args, context) => {
      //         const parent = context.nodeModel.getNodeById({
      //           id: source.parent,
      //         })
      //         return parent.frontmatter.avatar
      //       },
      //     },
      //     color: {
      //       type: "String!",
      //       resolve: (source, args, context) => {
      //         const parent = context.nodeModel.getNodeById({
      //           id: source.parent,
      //         })
      //         return parent.frontmatter.color
      //       },
      //     },
      //     members: {
      //       type: "[Actor!]",
      //       resolve: async (source, args, context) => {
      //         console.log({ source, args })
      //         const parent = context.nodeModel.getNodeById({
      //           id: source.parent,
      //         })
      //         const memberIds = parent.frontmatter.members ??[]
      //         const members = context.nodeModel
      //           .getAllNodes({
      //             type: "Actor",
      //           })
      //           .filter((m: any) => {
      //             console.log(m)
      //             const actorParentNode = context.nodeModel.getNodeById({
      //               id: m.parent
      //             })
      //             console.log(actorParentNode)
      //             return memberIds.includes(actorParentNode.frontmatter.uuid)
      //           })

      //         return members
      //       },
      //     },
      //   },
      // }),
    ],
    { name: "default-site-plugin" }
  )
}

export const createResolvers = ({ createResolvers }: CreateResolversArgs) => {
  const resolvers = {
    GroupFrontmatter: {
      uuid: {
        type: "String!",
        resolve: (source: any) => source.uuid,
      },
      members: {
        type: "[String!]",
        resolve: async (source: any, args: any, context: any) => {
          const memberIds = source.members ?? []
          const members = context.nodeModel
            .getAllNodes({
              type: "ActorFrontmatter",
            })
            .filter((m: any) => {
              console.log(m)
              return memberIds.includes(m.uuid)
            })

          return members
        },
      },
    },
  }
  createResolvers(resolvers)
}

export const sourceNodes = ({
  boundActionCreators,
  getNodes,
  getNode,
}: SourceNodesArgs) => {
  const { createNodeField } = boundActionCreators

  const mdNodes = pipe(
    getNodes(),
    A.filter((n) => n.internal.type === "MarkdownRemark")
  )

  const groupedNodes = pipe(
    mdNodes,
    group(
      Eq.contramap<string, Node>((n) => (n.fields as any).collection as string)(
        Eq.eqString
      )
    )
  )

  const getNodeByUUID = (uuids: string[]) =>
    mdNodes.filter((n) => uuids.includes((n.frontmatter as any).uuid))

  type EventsMap = Map<
    string,
    {
      actors: ActorFrontmatter[]
      groups: GroupFrontmatter[]
      topics: TopicFrontmatter[]
    }
  >

  type GroupsMap = Map<
    string,
    {
      members: ActorFrontmatter[]
    }
  >

  interface Results {
    events: EventsMap
    groups: GroupsMap
  }

  const initial: Results = { events: Map.empty, groups: Map.empty }

  const nodes = groupedNodes.reduce<Results>((acc, n) => {
    const firstNode = A.head(n)
    if (O.isSome(firstNode)) {
      const collection = (firstNode.value as any).fields.collection
      switch (collection) {
        case "events": {
          const eventsMap = n.reduce<EventsMap>((acc1, e) => {
            const actorNodes = getNodeByUUID(
              (e.frontmatter as any).actors || []
            )

            const groupNodes = getNodeByUUID(
              (e.frontmatter as any).groups || []
            )
            const topicNodes = getNodeByUUID(
              (e.frontmatter as any).topics || []
            )

            return Map.insertAt(Eq.eqString)(e.id, {
              actors: actorNodes.map((n: any) => n.frontmatter),
              groups: groupNodes.map((n: any) => n.frontmatter),
              topics: topicNodes.map((n: any) => n.frontmatter),
            })(acc1)
          }, acc.events)

          return {
            ...acc,
            events: eventsMap,
          }
        }

        case "groups": {
          const groupsMap = n.reduce<GroupsMap>((acc1, e) => {
            const memberNodes = getNodeByUUID(
              (e.frontmatter as any).members || []
            )

            return Map.insertAt(Eq.eqString)(e.id, {
              members: memberNodes.map((n: any) => n.frontmatter),
            })(acc1)
          }, acc.groups)

          return {
            ...acc,
            groups: groupsMap,
          }
        }
      }
    }
    return acc
  }, initial)

  Map.toArray(Ord.ordString)(nodes.events).forEach(([eventId, resources]) => {
    // console.log({ eventId, topics: resources.topics })
    createNodeField({
      node: getNode(eventId),
      name: `actors`,
      value: resources.actors,
    })

    createNodeField({
      node: getNode(eventId),
      name: `groups`,
      value: resources.groups,
    })

    createNodeField({
      node: getNode(eventId),
      name: `topics`,
      value: resources.topics,
    })
  })

  Map.toArray(Ord.ordString)(nodes.groups).forEach(([groupId, resources]) => {
    createNodeField({
      node: getNode(groupId),
      name: `members`,
      value: resources.members,
    })
  })

  return Promise.resolve(undefined as any)
}

type Collection =
  | "actors"
  | "articles"
  | "groups"
  | "events"
  | "pages"
  | "topics"

const collectionToTypeMap: Record<Collection, string> = {
  actors: "ActorFrontmatter",
  articles: "ArticleFrontmatter",
  groups: "GroupFrontmatter",
  events: "EventFrontmatter",
  pages: "PageFrontmatter",
  topics: "TopicFrontmatter",
}

export const onCreateNode = ({
  node,
  actions,
  getNode,
  createNodeId,
}: CreateNodeArgs) => {
  const { createNodeField, createNode } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const collection = getNode(node.parent).sourceInstanceName as Collection

    createNodeField({
      name: `collection`,
      node,
      value: collection,
    })

    const type = collectionToTypeMap[collection]
    const nodeId = createNodeId(`${type}-${node.id}`)
    console.log(`Creating ${type} node`, nodeId)
    createNode({
      ...(node.frontmatter as any),
      __type: type,
      id: nodeId,
      parent: node.id,
      internal: {
        type,
        contentDigest: node.internal.contentDigest,
      },
    })
  }
}
