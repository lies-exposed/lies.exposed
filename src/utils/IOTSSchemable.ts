import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { For } from "@models/Common/For"
import { JSONFromString } from "@models/Common/JSONFromString"
import { Currency, MoneyAmount } from "@models/Common/MoneyAmount"
import { BaseFrontmatter } from "@models/Frontmatter"
import { ProjectFrontmatter } from "@models/Project"
import { TransactionFrontmatter } from "@models/Transaction"
import { ActorFrontmatter } from "@models/actor"
import { GroupFrontmatter, GroupKind } from "@models/group"
import { Models } from "@models/index"
import { TopicFrontmatter } from "@models/topic"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as R from "fp-ts/lib/Record"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"

export const eqByUUID = pipe(
  Eq.eqString,
  Eq.contramap((f: BaseFrontmatter) => f.uuid)
)

const isBooleanType = (io: unknown): io is t.BooleanType =>
  (io as any)._tag !== undefined && (io as any)._tag === "BooleanType"

const isStringType = (io: unknown): io is t.StringType =>
  (io as any)._tag !== undefined && (io as any)._tag === "StringType"

const isNumberType = (io: unknown): io is t.NumberType =>
  (io as any)._tag !== undefined && (io as any)._tag === "NumberType"

const isUnionType = (io: unknown): io is t.UnionType<[t.ExactType<t.Any>]> =>
  (io as any)._tag !== undefined && (io as any)._tag === "UnionType"

const isLiteralType = (io: unknown): io is t.LiteralType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "LiteralType"

const isRecursiveType = <C extends t.Props>(
  io: unknown
): io is t.RecursiveType<t.ExactType<t.InterfaceType<C>>> =>
  (io as any)._tag !== undefined && (io as any)._tag === "RecursiveType"

const isArrayType = (io: unknown): io is t.ArrayType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "ArrayType"

const isGroupKind = (props: t.Mixed): props is typeof GroupKind => {
  return props.name === GroupKind.name
}

const isByGroupOrActor = (props: any): props is typeof ByGroupOrActor => {
  return isUnionType(props) && props.name === ByGroupOrActor.name
}

const isFor = (props: any): props is typeof For => {
  return isUnionType(props) && props.name === For.name
}

const isMoneyAmount = (props: t.Mixed): props is typeof MoneyAmount => {
  return props.name === MoneyAmount.name
}

const isCurrency = (props: t.Mixed): props is typeof Currency => {
  return props.name === Currency.name
}

// const isImpact = (
//   props: any
// ): props is t.UnionType<Array<t.InterfaceType<any>>> => {
//   return isUnionType(props) && props.name === "Impact"
// }

const traverseR = R.record.traverseWithIndex(
  E.getValidation(NEA.getSemigroup<Error>())
)
// const traverseA = A.array.traverse(E.getValidation(NEA.getSemigroup<Error>()))

type SchemaFn<P, S> = (key: string, props: P) => S

export interface IOTSSchemable<Props, Schema> {
  getDefaultProps: () => Props
  isArray: (p: Props) => Props
  isOption: (p: Props) => Props
  isNonEmptyArray: (p: Props) => Props
  isActorFrontmatter: SchemaFn<Props, Schema>
  isGroupFrontmatter: SchemaFn<Props, Schema>
  isTopicFrontmatter: SchemaFn<Props, Schema>
  isProjectFrontmatter: SchemaFn<Props, Schema>
  isTransactionFrontmatter: SchemaFn<Props, Schema>
  isGroupKind: SchemaFn<Props, Schema>
  // @TODO: define relations instead of by* and for*
  isByGroupOrActor: SchemaFn<Props, Schema>
  isByGroup: SchemaFn<Props, Schema>
  isByActor: SchemaFn<Props, Schema>
  isFor: SchemaFn<Props, Schema>
  isForGroup: SchemaFn<Props, Schema>
  isForProject: SchemaFn<Props, Schema>
  isMoneyAmount: SchemaFn<Props, Schema>
  isImpact: SchemaFn<Props, Schema>
  isImageSource: SchemaFn<Props, Schema>
  isImageFileNode: SchemaFn<Props, Schema>
  isDateFromISOString: SchemaFn<Props, Schema>
  isPolygon: SchemaFn<Props, Schema>
  isPoint: SchemaFn<Props, Schema>
  isLiteral: SchemaFn<Props, Schema>
  isNumber: SchemaFn<Props, Schema>
  isBoolean: SchemaFn<Props, Schema>
  isString: SchemaFn<Props, Schema>
}

type ModelCommonKeys = keyof typeof Models.Common
type ModelFrontmaterKeys = keyof typeof Models.Frontmatter
type ModelRecord = Record<ModelCommonKeys | ModelFrontmaterKeys, t.Mixed>

const getTypeByName = (
  typeName: string,
  modelRecord: ModelRecord
): E.Either<NEA.NonEmptyArray<Error>, t.Mixed> => {
  return pipe(
    modelRecord,
    R.lookup(typeName),
    E.fromOption(() => NEA.of(new Error(`No match found for type ${typeName}`)))
  )
}

interface IOTSSchema<S> {
  traverseExactType: <C extends t.Props>(
    ioType: t.ExactType<t.InterfaceType<C>>
  ) => E.Either<NEA.NonEmptyArray<Error>, Record<keyof C, S>>
  traverseAnyType: <C extends t.Props>(
    ioType:
      | t.RecursiveType<t.ExactType<t.InterfaceType<C>>>
      | t.UnionType<[t.ExactType<t.InterfaceType<C>>]>
      | t.ExactType<t.InterfaceType<C>>
  ) => E.Either<NEA.NonEmptyArray<Error>, Record<string, Record<keyof C, S>>>
}

interface GetIOTSToSchemaProps<P, S> {
  models: typeof Models
  schema: IOTSSchemable<P, S>
}

export const GetIOTSToSchema = <P, S>(
  opts: GetIOTSToSchemaProps<P, S>
): IOTSSchema<S> => {
  const modelsRecord = {
    ...opts.models.Common,
    ...opts.models.Frontmatter,
    [nonEmptyArray(opts.models.Common.ImageSource).name]: nonEmptyArray(
      opts.models.Common.ImageSource
    ),
    [nonEmptyArray(JSONFromString.pipe(opts.models.Common.Polygon)).name]: nonEmptyArray(JSONFromString.pipe(opts.models.Common.Polygon)),
    [JSONFromString.pipe(opts.models.Common.Polygon).name]: JSONFromString.pipe(opts.models.Common.Polygon),
    [JSONFromString.pipe(opts.models.Common.Point).name]: JSONFromString.pipe(
      opts.models.Common.Point
    ),
    [t.array(opts.models.Frontmatter.GroupFrontmatter).name]: t.array(
      opts.models.Frontmatter.GroupFrontmatter
    ),
    [t.array(opts.models.Frontmatter.ActorFrontmatter).name]: t.array(
      opts.models.Frontmatter.ActorFrontmatter
    ),
    [t.array(t.string).name]: t.array(t.string),
    [t.array(opts.models.Common.ImageSource).name]: t.array(
      opts.models.Common.ImageSource
    ),
    [DateFromISOString.name]: DateFromISOString,
    string: t.string,
    number: t.number,
  }

  const traverseExactType = <C extends t.Props>(
    ioType: t.ExactType<t.InterfaceType<C>>
  ): E.Either<NEA.NonEmptyArray<Error>, { [key in keyof C]: S }> => {
    const loop = <C extends t.Props>(
      acc: { [key in keyof C]: S },
      key: string,
      type: t.Mixed | t.InterfaceType<C>,
      props: P
    ): E.Either<NEA.NonEmptyArray<Error>, { [key in keyof C]: S }> => {
      if (isRecursiveType(type)) {
        return loop(acc, key, type.type, props)
      }

      if (isArrayType(type)) {
        return loop(acc, key, type.type, opts.schema.isArray(props))
      }

      // console.log({key, type})

      // Option
      const optionMatch = type.name.match(/Option<(.*?)>/)
      // const optionMatch = type.name.match(/Option<(\w+)>|Option<(\w+<(\w+)>)>/)
      if (optionMatch !== null) {
        const firstBadThing = type.name.replace("Option<", "")
        const newKey = firstBadThing.substr(0, firstBadThing.length - 1)
        const newType = getTypeByName(newKey, modelsRecord)

        return pipe(
          newType,
          E.chain((type) => loop(acc, key, type, opts.schema.isOption(props)))
        )
      }

      // NonEmptyArray

      const neaMatch = type.name.match(/NonEmptyArray<(.*?)>/)

      if (neaMatch !== null) {
        // console.log(neaMatch)
        const newKeyPartial = type.name.replace("NonEmptyArray<", "")
        const newKey = newKeyPartial.substr(0, newKeyPartial.length - 1)
        return pipe(
          getTypeByName(newKey, modelsRecord),
          E.chain((type) =>
            loop(acc, key, type, opts.schema.isNonEmptyArray(props))
          )
        )
      }

      if (type.name === ProjectFrontmatter.name) {
        return E.right({
          ...acc,
          [key]: opts.schema.isProjectFrontmatter(key, props),
        })
      }

      if (type.name === TransactionFrontmatter.name) {
        return E.right({
          ...acc,
          [key]: opts.schema.isTransactionFrontmatter(key, props),
        })
      }

      if (type.name === ActorFrontmatter.name) {
        return E.right({
          ...acc,
          [key]: opts.schema.isActorFrontmatter(key, props),
        })
      }

      if (type.name === GroupFrontmatter.name) {
        return E.right({
          ...acc,
          [key]: opts.schema.isGroupFrontmatter(key, props),
        })
      }

      if (type.name === TopicFrontmatter.name) {
        return E.right({
          ...acc,
          [key]: opts.schema.isTopicFrontmatter(key, props),
        })
      }

      if (isGroupKind(type)) {
        return E.right({
          ...acc,
          [key]: opts.schema.isGroupKind(key, props),
        })
      }

      if (isByGroupOrActor(type)) {
        return E.right({
          ...acc,
          [key]: opts.schema.isByGroupOrActor(key, props),
        })
      }

      if (isCurrency(type)) {
        return E.right({
          ...acc, [key]: opts.schema.isString(key, props)
        })
      }

      if (isMoneyAmount(type)) {
        return E.right({
          ...acc,
          [key]: opts.schema.isMoneyAmount(key, props),
        })
      }

      if (isFor(type)) {
        return E.right({
          ...acc,
          [key]: opts.schema.isFor(key, props),
        })
      }

      // if (isImpact(type)) {
      //   return E.right({
      //     ...acc,
      //     [key]: opts.schema.isImpact(key, props),
      //   })
      // }

      if (type.name === "ImageSource") {
        return E.right({
          ...acc,
          [key]: opts.schema.isImageSource(key, props),
        })
      }

      if (type.name === "ImageFileNode") {
        return E.right({
          ...acc,
          [key]: opts.schema.isImageFileNode(key, props),
        })
      }

      if (isLiteralType(type)) {
        return E.right({
          ...acc,
          [key]: opts.schema.isLiteral(key, props),
        })
      }

      if (isBooleanType(type)) {
        return E.right({
          ...acc,
          [key]: opts.schema.isBoolean(key, props),
        })
      }

      if (type.name === "ColorType") {
        return E.right({
          ...acc,
          [key]: opts.schema.isString(key, props),
        })
      }

      if (type.name === "DateFromISOString") {
        return E.right({
          ...acc,
          [key]: opts.schema.isDateFromISOString(key, props),
        })
      }

      if (
        type.name === "pipe(JSONFromString, Polygon)" ||
        type.name === "Polygon"
      ) {
        return E.right({
          ...acc,
          [key]: opts.schema.isPolygon(key, props),
        })
      }

      if (
        type.name === "pipe(JSONFromString, Point)" ||
        type.name === "Point"
      ) {
        return E.right({
          ...acc,
          [key]: opts.schema.isPoint(key, props),
        })
      }

      if (isStringType(type)) {
        return E.right({
          ...acc,
          [key]: opts.schema.isString(key, props),
        })
      }

      if (isNumberType(type)) {
        return E.right({
          ...acc,
          [key]: opts.schema.isNumber(key, props),
        })
      }

      return E.right(acc)
    }

    const init: { [key in keyof C]: S } = {} as any

    return pipe(
      traverseR(ioType.type.props, (key, prop) =>
        loop(init, key, prop, opts.schema.getDefaultProps())
      ),
      E.map(R.reduce(init, (acc, r) => ({ ...acc, ...r })))
    )
  }

  const traverseAnyType = <C extends t.Props>(
    ioType:
      | t.RecursiveType<t.ExactType<t.InterfaceType<C>>>
      | t.UnionType<[t.ExactType<t.InterfaceType<C>>]>
      | t.ExactType<t.InterfaceType<C>>
  ): E.Either<NEA.NonEmptyArray<Error>, Record<string, Record<keyof C, S>>> => {
    if (isRecursiveType(ioType)) {
      return pipe(
        traverseExactType(ioType.type),
        E.map((schema) => ({
          [ioType.type.name]: schema,
        }))
      )
    }

    if (isUnionType(ioType)) {
      const init: Record<
        string,
        E.Either<NEA.NonEmptyArray<Error>, Record<keyof C, S>>
      > = {}
      return pipe(
        ioType.types,
        A.reduce(init, (acc, type) => ({
          ...acc,
          [type.name]: traverseExactType(type),
        })),
        R.sequence(E.getValidation(NEA.getSemigroup<Error>()))
      )
    }

    return pipe(
      traverseExactType(ioType),
      E.map((schema) => ({ [ioType.name]: schema }))
    )
  }

  return {
    traverseExactType,
    traverseAnyType,
  }
}
