import { BaseFrontmatter } from "@models/Frontmatter"
import { Models } from "@models/index"
import { IOTSSchemable, GetIOTSToSchema } from "@utils/IOTSSchemable"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import { pipe } from "fp-ts/lib/pipeable"
import { CreateResolversArgs } from "gatsby"
import {
  ActorFrontmatterManyResolver,
  GetForGroupResolver,
  GetForProjectResolver,
  GetBooleanResolver,
  GetByActorResolver,
  GetByGroupOrActorResolver,
  GetByGroupResolver,
  GetDateResolver,
  GetFileResolver,
  GetForResolver,
  GetImageSourceResolver,
  GetNumberResolver,
  GetStringResolver,
  GroupFrontmatterManyResolver,
  ProjectFrontmatterManyResolver,
  TopicFrontmatterManyResolver,
  GetMoneyAmountResolver,
  GetImpactResolver,
} from "./resolvers"
import { GetResolverOptions, Resolver } from "./resolvers/Resolver"

const IOTSToGQLResolver: IOTSSchemable<
  GetResolverOptions,
  Resolver<any>
> = {
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
    return GroupFrontmatterManyResolver({ ...props, key })
  },
  isActorFrontmatter(key, props) {
    return ActorFrontmatterManyResolver({ ...props, key })
  },
  isTopicFrontmatter(key, props) {
    return TopicFrontmatterManyResolver({ ...props, key })
  },
  isProjectFrontmatter(key, props) {
    // console.log('projectfrontmatter', key)
    return ProjectFrontmatterManyResolver(props)
  },
  isTransactionFrontmatter(key, props) {
    return GetStringResolver(props)
  },
  isByGroupOrActor(key, props) {
    return GetByGroupOrActorResolver({ ...props, key })
  },
  isByActor(key, props) {
    return GetByActorResolver({ ...props, key })
  },
  isByGroup(key, props) {
    return GetByGroupResolver({ ...props, key })
  },
  isGroupKind(key, props) {
    return GetStringResolver({ ...props, key })
  },
  isImpact(key, props) {
    return GetImpactResolver({ ...props, key })
  },
  isFor(key, props) {
    return GetForResolver({ ...props, key })
  },
  isForGroup(key, props) {
    return GetForGroupResolver({ ...props, key })
  },
  isForProject(key, props) {
    return GetForProjectResolver({ ...props, key })
  },
  isLiteral(key, props) {
    return GetStringResolver({ ...props, key })
  },
  isMoneyAmount(key, props) {
    return GetMoneyAmountResolver({ ...props, key })
  },
  isPoint(key, props) {
    return GetStringResolver({ ...props, key })
  },
  isPolygon(key, props) {
    // console.log('polygon', props)
    return GetStringResolver({ ...props, key })
  },
  isImageSource(key, props) {
    return GetImageSourceResolver(props)
  },
  isImageFileNode(key, props) {
    return GetFileResolver(props)
  },
  isDateFromISOString(key, props) {
    return GetDateResolver({ ...props })
  },
  isNumber(key, props) {
    return GetNumberResolver({ ...props, key })
  },
  isBoolean(key, props) {
    return GetBooleanResolver({ ...props, key })
  },
  isString(key, props) {
    if (key === "uuid") {
      return GetStringResolver({ ...props, required: true })
    }
    return GetStringResolver(props)
  },
}

const IOTSResolversSchema = GetIOTSToSchema({
  models: Models,
  schema: IOTSToGQLResolver,
})

export const createResolvers = ({
  createResolvers,
}: CreateResolversArgs): void => {
  pipe(
    [
      ...Object.keys(Models.Common)
        // don't create resolvers for union types
        .filter(
          (k) =>
            ![
              BaseFrontmatter.name,
              Models.Common.ByGroupOrActor.name,
              // Models.Common.ByGroup.name,
              // Models.Common.ByActor.name,
              Models.Common.For.name,
              Models.Common.Impact.name,
            ].includes(k)
        )
        .map((k) => (Models.Common as any)[k]),
      ...Object.values(Models.Frontmatter),
    ],
    A.map((type) => IOTSResolversSchema.traverseAnyType(type)),
    A.sequence(E.getValidation(NEA.getSemigroup<Error>())),
    E.map((resolverList) =>
      resolverList.reduce((acc, r) => ({ ...acc, ...r }), {})
    ),
    E.fold(
      (e) => {
        // eslint-disable-next-line no-console
        console.error("error in creating resolvers", e)
        process.exit(-1)
      },
      (resolvers) => {
        // eslint-disable-next-line no-console
        console.log("resolvers", resolvers)
        createResolvers(resolvers)
      }
    )
  )
}
