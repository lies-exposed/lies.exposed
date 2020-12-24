import * as path from "path"
// import { BaseFrontmatter } from "@models/Frontmatter"
import { Relation } from "@models/Relation"
import { Models } from "@models/index"
import { group } from "@utils/common"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
// import * as TE from "fp-ts/lib/TaskEither"
import { pipe } from "fp-ts/lib/pipeable"
import { GetResolveFn, MakeGetResolver, MakeType } from "./Resolver"

export const GetStringType = MakeType("String")
export const GetBooleanType = MakeType("Boolean")
export const GetDateType = MakeType("Date")
export const GetNumberType = MakeType("Int")
export const GetFileType = MakeType("File")

export const GetImageSourceType = MakeType(Models.Common.ImageSource.name)
export const GetActorFrontmatterType = MakeType(
  Models.Frontmatter.ActorFrontmatter.name
)
export const GetAreaFrontmatterType = MakeType(
  Models.Frontmatter.AreaFrontmatter.name
)
export const GetGroupFrontmatterType = MakeType(
  Models.Frontmatter.GroupFrontmatter.name
)
export const GetByGroupOrActorType = MakeType(Models.Common.ByGroupOrActor.name)
export const GetByGroupType = MakeType(Models.Common.ByGroup.name)
export const GetByActorType = MakeType(Models.Common.ByActor.name)

export const GetForType = MakeType(Models.Common.For.name)
export const GetForProjectType = MakeType(Models.Common.ForProject.name)
export const GetForGroupType = MakeType(Models.Common.ForGroup.name)
export const GetImpactType = MakeType(Models.Common.Impact.name)

export const GetTopicFrontmatterType = MakeType(
  Models.Frontmatter.TopicFrontmatter.name
)
export const GetProjectFrontmatterType = MakeType(
  Models.Frontmatter.ProjectFrontmatter.name
)

export const GetMoneyAmountType = MakeType(Models.Common.MoneyAmount.name)

export const GetStringResolver = MakeGetResolver()(GetStringType)
export const GetBooleanResolver = MakeGetResolver()(GetBooleanType)
export const GetDateResolver = MakeGetResolver()(GetDateType)
export const GetNumberResolver = MakeGetResolver()(GetNumberType)
export const GetFileResolver = MakeGetResolver()(GetFileType)
export const GetMoneyAmountResolver = MakeGetResolver()(GetMoneyAmountType)

// const relationMap = {
//   project: "ProjectFrontmatter",
//   group: "GroupFrontmatter",
//   actor: "ActorFrontmatter",
// }

const getTypeResolverForRelation = <T extends string>(
  relation: T,
  prefix: string
): GetResolveFn<any> => () => (opts) => async (
  source: any,
  args: any,
  context: any
): Promise<any> => {
  // console.log(`Resolving nodes for ${relation} ${prefix}`, { source, opts })

  const addInternal = (prefix: string, type: string) => (n: any) => ({
    internal: {
      type: `${prefix}${type}`,
    },
    ...n,
  })

  return pipe(
    source[opts.key],
    E.fromNullable(
      new Error(`Missing key ${opts.key} in ${JSON.stringify(source)}`)
    ),
    E.map((values) => {
      if (Array.isArray(values)) {
        return pipe(
          group(Eq.eq.contramap(Eq.eqString, (r: Relation) => r.type))(values),
          A.map((items) => {
            return items.map((item) => addInternal(prefix, item.type)(item))
          }),
          A.flatten
        )
      }

      return addInternal(prefix, values.type)(values)
    }),
    E.map((result) => (opts.many ? result : result[0])),
    E.fold(
      (e) => {
        // eslint-disable-next-line no-console
        console.error("error", e)
        return undefined
      },
      (result) => {
        return result
      }
    )
  )
}

const ManyResolver = MakeGetResolver()

export const GetForResolver = MakeGetResolver(
  getTypeResolverForRelation("For", "For")
)(GetForType)
export const GetForGroupResolver = MakeGetResolver()(GetForGroupType)
export const GetForProjectResolver = MakeGetResolver()(GetForProjectType)

export const GetByGroupOrActorResolver = MakeGetResolver(
  getTypeResolverForRelation("ByGroupOrActor", "By")
)(GetByGroupOrActorType)

export const GetByGroupResolver = MakeGetResolver()(GetByGroupType)
export const GetByActorResolver = MakeGetResolver()(GetByActorType)
export const GetImpactResolver = MakeGetResolver(
  getTypeResolverForRelation("Impact", "")
)(GetImpactType)

export const ProjectFrontmatterManyResolver = ManyResolver(
  GetProjectFrontmatterType
)
export const ActorFrontmatterManyResolver = ManyResolver(
  GetActorFrontmatterType
)

export const GroupFrontmatterManyResolver = ManyResolver(
  GetGroupFrontmatterType
)

export const TopicFrontmatterManyResolver = ManyResolver(
  GetTopicFrontmatterType
)

interface GQLImageSource {
  author: string
  description?: string
  image: string
}

export const GetImageSourceResolver = MakeGetResolver(
  (type) => (opts) => async (source: any, args: any, context: any) => {
    const sourceImages: GQLImageSource[] = source[opts.key] ?? []
    if (A.isEmpty(sourceImages)) {
      return null
    }

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
          O.map((image) => ({
            ...image,
            image: result,
          }))
        )
      ),
      A.compact
    )
  }
)(GetImageSourceType)
