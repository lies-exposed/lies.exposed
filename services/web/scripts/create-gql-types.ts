/* eslint-disable no-restricted-imports */
/* eslint-disable import/first */
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("tsconfig-paths").register()

import { exec } from "child_process"
import * as fs from "fs"
import * as path from "path"
import { BaseFrontmatter } from "@models/Frontmatter"
import { sequenceT } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as R from "fp-ts/lib/Record"
import * as T from "fp-ts/lib/Task"
import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import {
  GetActorFrontmatterType,
  GetByGroupOrActorType,
  GetBooleanType,
  GetByActorType,
  GetByGroupType,
  GetDateType,
  GetFileType,
  GetGroupFrontmatterType,
  GetImageSourceType,
  GetNumberType,
  GetProjectFrontmatterType,
  GetStringType,
  GetTopicFrontmatterType,
  GetForType,
  GetForGroupType,
  GetForProjectType,
  GetImpactType,
  GetMoneyAmountType,
} from "../gatsby/gatsby-node/resolvers"
import { GetResolverOptions } from "../gatsby/gatsby-node/resolvers/Resolver"
import { Models } from "../src/models"
import {
  IOTSSchemable,
  GetIOTSToSchema,
} from "../src/utils/IOTSSchemable"

const byUUIDModifier = (opts: GetResolverOptions): string =>
  `@link(by: \`uuid\`)` // ${opts.many ? "% from: `uuid`" : ""}

const IOTSToGQLSchema: IOTSSchemable<GetResolverOptions, string> = {
  getDefaultProps() {
    return {
      required: true,
      many: false,
      key: "__unknown",
    }
  },
  isArray(key, props) {
    return { ...props, many: true, required: false }
  },
  isOption(key, props) {
    return { ...props, required: false }
  },
  isNonEmptyArray(key, props) {
    return { ...props, required: true, many: true }
  },
  isGroupFrontmatter(key, props) {
    return GetGroupFrontmatterType({
      ...props,
      key,
      modifiers: [byUUIDModifier(props)],
    })
  },
  isActorFrontmatter(key, props) {
    return GetActorFrontmatterType({
      ...props,
      key,
      modifiers: [byUUIDModifier(props)],
    })
  },
  isTopicFrontmatter(key, props) {
    return GetTopicFrontmatterType({
      ...props,
      key,
      modifiers: [byUUIDModifier(props)],
    })
  },
  isGroupKind(key, props) {
    return GetStringType({...props, key })
  },
  isByGroupOrActor(key, props) {
    // console.log("is by group or actor")
    return GetByGroupOrActorType({ ...props, key })
  },
  isByActor(key, props) {
    return GetByActorType({ ...props, key })
  },
  isByGroup(key, props) {
    return GetByGroupType({ ...props, key })
  },
  isImpact(key, props) {
    return GetImpactType({ ...props, key })
  },
  isFor(key, props) {
    return GetForType({ ...props, key })
  },
  isForGroup(key, props) {
    return GetForGroupType({ ...props, key })
  },
  isForProject(key, props) {
    return GetForProjectType({ ...props, key })
  },
  isLiteral(key, props) {
    return GetStringType({ ...props, key })
  },
  isMoneyAmount(key, props) {
    return GetMoneyAmountType({ ...props, key })
  },
  isPolygon(key, props) {
    return GetStringType({ ...props, key })
  },
  isPoint(key, props) {
    return GetStringType({ ...props, key })
  },
  isProjectFrontmatter(key, props) {
    return GetProjectFrontmatterType({
      ...props,
      key,
      modifiers: [byUUIDModifier(props)],
    })
  },
  isTransactionFrontmatter(key, props) {
    return GetStringType(props)
  },
  isImageSource(key, props) {
    return GetImageSourceType(props)
  },
  isImageFileNode(key, props) {
    return GetFileType({ ...props, modifiers: ["@fileByRelativePath"] })
  },
  isDateFromISOString(key, props) {
    return GetDateType({ ...props, key })
  },
  isNumber(key, props) {
    return GetNumberType(props)
  },
  isBoolean(key, props) {
    return GetBooleanType(props)
  },
  isString(key, props) {
    if (key === "uuid") {
      return GetStringType({ ...props, required: true })
    }
    return GetStringType(props)
  },
}

const formatType = (prefix: string, type: Record<string, any>): string => {
  const typeContent = JSON.stringify(type, null, 2)
    // eslint-disable-next-line no-useless-escape
    .replace(/("|')/g, "")
    .replace(/`uuid`/g, '"uuid"')
    .replace(/,/g, "")
    .replace(/%/g, ",")

  return `${prefix} ${typeContent} \n`
}

const IOTSGQLSchema = GetIOTSToSchema({
  models: Models,
  schema: IOTSToGQLSchema,
})

function lift<E, A, B>(
  check: (a: A, b: B) => E.Either<E[], A>
): (a: A, b: B) => E.Either<E[], A[]> {
  return (a, b) =>
    pipe(
      check(a, b),
      E.map((a) => [a])
    )
}

const getGQLTypeDefinition = <C extends t.Props>(
  prefix: string,
  type: t.ExactType<t.InterfaceType<C>>
): E.Either<Error[], string> => {
  return pipe(
    IOTSGQLSchema.traverseExactType(type),
    E.map((typeSchema) => formatType(prefix, typeSchema))
  )
}

const getGQLTypeDefinitionV = lift(getGQLTypeDefinition)


const clearFile = (filePath: string): TE.TaskEither<Error, void> => {
  return async () =>
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(E.right(undefined))
      }, 500)
      try {
        exec(`rm -rf ${filePath}`)
      } catch (e) {
        reject(E.left(e))
      }
    })
}

const getGQLTypeDefinitions = <ModelKey extends keyof Models>(
  sectionKey: ModelKey,
  models: typeof Models[ModelKey]
): TE.TaskEither<Error[], string[]> => {
  const result = pipe(
    Object.keys(models),
    A.map((key) => {
      const model = (models as any)[key]
      // console.log("model name", key)
      if (model._tag === "RecursiveType") {
        return getGQLTypeDefinitionV(
          `type ${key} implements Node & BaseFrontmatter @dontInfer`,
          model.type
        )
      }

      if (model._tag === "UnionType") {
        const types = model.types as NEA.NonEmptyArray<
          t.ExactType<t.InterfaceType<any>>
        >

        const gqlTypeDefs = NEA.nonEmptyArray.map(types, (unionType) => {
          return getGQLTypeDefinitionV(
            `type ${unionType.name} implements Node & ${model.name} ${
              [
                Models.Common.ByGroupOrActor.name,
                Models.Common.For.name,
                Models.Common.Impact.name,
              ].includes(model.name)
                ? ""
                : "& Frontmatter"
            } @dontInfer`,
            unionType
          )
        })

        return pipe(
          gqlTypeDefs,
          A.array.sequence(E.either),
          E.map(A.flatten),
          E.map((typesDef) =>
            [
              [
                Models.Common.ByGroupOrActor.name,
                Models.Common.For.name,
                Models.Common.Impact.name,
              ].includes(model.name)
                ? `interface ${model.name} { \n \t type: String! \n }`
                : `interface ${model.name} { \n \t type: String! \n uuid: String! }`,
            ].concat(typesDef)
          )
        )
      }

      if (sectionKey === "Common") {
        return getGQLTypeDefinitionV(
          key === BaseFrontmatter.name
            ? `interface ${key}`
            : `type ${key} implements Node @dontInfer`,
          model
        )
      }

      const fileContent = getGQLTypeDefinitionV(
        `type ${key} implements Node & BaseFrontmatter @dontInfer`,
        model
      )

      return fileContent
    }),
    A.array.sequence(E.either),
    E.map(A.flatten),
    E.map((defs) => [`# ${sectionKey} \n`].concat(defs)),
    TE.fromEither
  )

  return result
}

const run = (
  models: typeof Models,
  outputFile: string
): TE.TaskEither<Error[], string[]> => {
  return pipe(
    clearFile(outputFile),
    TE.mapLeft(A.of),
    TE.chain(() =>
      sequenceT(TE.taskEither)(
        pipe(
          models.Common,
          R.filterWithIndex(
            (k) =>
              ![
                ...Models.Common.ByGroupOrActor.types.map((t) => t.name),
                ...Models.Common.For.types.map((t) => t.name),
                ...Models.Common.Impact.types.map((t) => t.name),
              ].includes(k)
          ),
          (commonModels) => getGQLTypeDefinitions("Common", commonModels as any)
        ),
        getGQLTypeDefinitions("Frontmatter", models.Frontmatter)
      )
    ),
    TE.map(A.flatten),
    TE.chain((modelsDefinition) =>
      pipe(
        TE.taskify(fs.writeFile)(
          outputFile,
          // TODO:
          modelsDefinition
            .concat(`type Mdx implements Node { frontmatter: Frontmatter }`)
            .join("\n")
        ),
        TE.mapLeft((e) => [e]),
        TE.map(() => modelsDefinition)
      )
    )
  )
}

const outputFile = path.join(
  process.cwd(),
  `gatsby/gatsby-node/gql-types/types.gql`
)

// eslint-disable-next-line @typescript-eslint/no-floating-promises
pipe(
  run(Models, outputFile),
  TE.fold(
    (e) => {
      // eslint-disable-next-line no-console
      console.error(e)
      return T.task.of(undefined)
    },
    (results) => {
      // eslint-disable-next-line no-console
      console.log("Completed!", results)
      return T.task.of(undefined)
    }
  )
)()
