/* eslint-disable no-restricted-imports */
import * as fs from "fs"
import { EventMap } from "@models/events"
import { Models } from "@models/index"
import { logInPipe } from "@utils/logger"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { CreateSchemaCustomizationArgs } from "gatsby"
import { MD_FRONTMATTER_TYPE } from "./consts"
// import { MD_FRONTMATTER_TYPE } from "./consts"

export const createSchemaCustomization = async ({
  actions,
  schema,
}: CreateSchemaCustomizationArgs): Promise<void> => {
  const { createTypes } = actions

  try {
    const typeDefs = fs.readFileSync(`${__dirname}/gql-types/types.gql`, {
      encoding: "utf-8",
    })

    const frontmatterTypes = [
      ...Object.values(Models.Frontmatter).map((m) => m.name),
      MD_FRONTMATTER_TYPE,
    ]
  
    // console.log({ typeDefs, frontmatterTypes })
  
    createTypes(
      [
        typeDefs as any,
        schema.buildUnionType({
          name: Models.Common.ByGroupOrActor.name,
          types: [Models.Common.ByGroup.name, Models.Common.ByActor.name],
          resolveType: (source) => {
            console.log("build union type for ByGroupOrActor", source)
            return pipe(
              Array.isArray(source) ? source[0] : source,
              O.fromPredicate((source) => source.type !== undefined),
              O.map(source => source.type),
              logInPipe("ByGroupOrActor type"),
              O.map((type) =>
                type === Models.Common.ByGroup.type.props.type.value
                  ? Models.Common.ByGroup.name
                  : type === Models.Common.ByActor.type.props.type.value
                  ? Models.Common.ByActor.name
                  : "UndefinedType"
              ),
              O.getOrElse(() => "UndefinedType"),
              logInPipe("ByGroupOrActor type"),
            )
          },
        }),
        schema.buildUnionType({
          name: Models.Common.For.name,
          types: [Models.Common.ForGroup.name, Models.Common.ForProject.name],
          resolveType: (source) => {
            console.log("build union type for `For`", source)
            return pipe(
              Array.isArray(source) ? source[0] : source,
              O.fromPredicate((source) => source.type !== undefined),
              O.map((source) => source.type),
              logInPipe("For type"),
              O.map((type) =>
                type === Models.Common.ForGroup.type.props.type.value
                  ? Models.Common.ForGroup.name
                  : type === Models.Common.ForProject.type.props.type.value
                  ? Models.Common.ForProject.name
                  : "UndefinedType"
              ),
              O.getOrElse(() => "String"),
              logInPipe("For type"),
            )
          },
        }),
        schema.buildUnionType({
          name: "Frontmatter",
          types: frontmatterTypes,
          resolveType: async (source, context, info) => {
            // todo: use info.rootValue.path instead decoding each source
            if (source !== undefined ?? source.type !== undefined) {
              if (Object.keys(EventMap).includes(source.type)) {
                return source.type
              }
  
              return source.type
            }
            // eslint-disable-next-line no-console
            console.log("source", { source, rootValue: info.rootValue })
  
            return MD_FRONTMATTER_TYPE
          },
        }),
      ],
      { name: "default-site-plugin" }
    )
  } catch (e) {
    console.error(e)
    process.exit(-1)
  }
  

  
}
