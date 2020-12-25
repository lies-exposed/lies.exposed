// import { ActorFrontmatter, GroupFrontmatter, GroupKind } from "@econnessione/io"
// import { ByGroupOrActor } from "@econnessione/ioCommon/ByGroupOrActor"
// import { For } from "@econnessione/ioCommon/For"
// import { JSONFromString } from "@econnessione/ioCommon/JSONFromString"
// import { Currency, MoneyAmount } from "@econnessione/ioCommon/MoneyAmount"
// import { BaseFrontmatter } from "@econnessione/ioFrontmatter"
// import { Models } from "@econnessione/ioindex"
// import { ProjectFrontmatter } from "@econnessione/ioProject"
// import { TopicFrontmatter } from "@econnessione/iotopic"
// import { TransactionFrontmatter } from "@econnessione/ioTransaction"
// import * as A from "fp-ts/lib/Array"
// import * as E from "fp-ts/lib/Either"
import { Common } from "@econnessione/io";
import * as Eq from "fp-ts/lib/Eq";
// import * as NEA from "fp-ts/lib/NonEmptyArray"
// import { pipe } from "fp-ts/lib/pipeable"
// import * as R from "fp-ts/lib/Record"
// import * as t from "io-ts"
// import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
// import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { pipe } from "fp-ts/lib/pipeable";

export const eqByUUID = pipe(
  Eq.eqString,
  Eq.contramap((f: Common.BaseFrontmatter) => f.id)
)

// const isBooleanType = (io: unknown): io is t.BooleanType =>
//   (io as any)._tag !== undefined && (io as any)._tag === "BooleanType"

// const isStringType = (io: unknown): io is t.StringType =>
//   (io as any)._tag !== undefined && (io as any)._tag === "StringType"

// const isNumberType = (io: unknown): io is t.NumberType =>
//   (io as any)._tag !== undefined && (io as any)._tag === "NumberType"

// const isUnionType = (io: unknown): io is t.UnionType<[t.ExactType<t.Any>]> =>
//   (io as any)._tag !== undefined && (io as any)._tag === "UnionType"

// const isLiteralType = (io: unknown): io is t.LiteralType<any> =>
//   (io as any)._tag !== undefined && (io as any)._tag === "LiteralType"

// const isRecursiveType = <C extends t.Props>(
//   io: unknown
// ): io is t.RecursiveType<t.ExactType<t.InterfaceType<C>>> =>
//   (io as any)._tag !== undefined && (io as any)._tag === "RecursiveType"

// const isArrayType = (io: unknown): io is t.ArrayType<any> =>
//   (io as any)._tag !== undefined && (io as any)._tag === "ArrayType"

// const isGroupKind = (props: t.Mixed): props is typeof GroupKind => {
//   return props.name === GroupKind.name
// }

// const isByGroupOrActor = (props: any): props is typeof ByGroupOrActor => {
//   return isUnionType(props) && props.name === ByGroupOrActor.name
// }

// const isFor = (props: any): props is typeof For => {
//   return isUnionType(props) && props.name === For.name
// }

// const isMoneyAmount = (props: t.Mixed): props is typeof MoneyAmount => {
//   return props.name === MoneyAmount.name
// }

// const isCurrency = (props: t.Mixed): props is typeof Currency => {
//   return props.name === Currency.name
// }

// // const isImpact = (
// //   props: any
// // ): props is t.UnionType<Array<t.InterfaceType<any>>> => {
// //   return isUnionType(props) && props.name === "Impact"
// // }

// const traverseR = R.record.traverseWithIndex(
//   E.getValidation(NEA.getSemigroup<Error>())
// )
// // const traverseA = A.array.traverse(E.getValidation(NEA.getSemigroup<Error>()))

// type SchemaFn<P, S> = (key: string, props: P) => S

// export interface IOTSSchemable<Context, Schema> {
//   getDefaultProps: () => Context
//   isArray: (key: string, p: Context) => Context
//   isOption: (key: string, p: Context) => Context
//   isNonEmptyArray: (key: string, p: Context) => Context
//   isActorFrontmatter: SchemaFn<Context, Schema>
//   isGroupFrontmatter: SchemaFn<Context, Schema>
//   isTopicFrontmatter: SchemaFn<Context, Schema>
//   isProjectFrontmatter: SchemaFn<Context, Schema>
//   isTransactionFrontmatter: SchemaFn<Context, Schema>
//   isGroupKind: SchemaFn<Context, Schema>
//   // @TODO: define relations instead of by* and for*
//   isByGroupOrActor: SchemaFn<Context, Schema>
//   isByGroup: SchemaFn<Context, Schema>
//   isByActor: SchemaFn<Context, Schema>
//   isFor: SchemaFn<Context, Schema>
//   isForGroup: SchemaFn<Context, Schema>
//   isForProject: SchemaFn<Context, Schema>
//   isMoneyAmount: SchemaFn<Context, Schema>
//   isImpact: SchemaFn<Context, Schema>
//   isImageSource: SchemaFn<Context, Schema>
//   isImageFileNode: SchemaFn<Context, Schema>
//   isDateFromISOString: SchemaFn<Context, Schema>
//   isPolygon: SchemaFn<Context, Schema>
//   isPoint: SchemaFn<Context, Schema>
//   isLiteral: SchemaFn<Context, Schema>
//   isNumber: SchemaFn<Context, Schema>
//   isBoolean: SchemaFn<Context, Schema>
//   isString: SchemaFn<Context, Schema>
// }

// type ModelCommonKeys = keyof typeof Models.Common
// type ModelFrontmaterKeys = keyof typeof Models.Frontmatter
// type ModelRecord = Record<ModelCommonKeys | ModelFrontmaterKeys, t.Mixed>

// const getTypeByName = (
//   typeName: string,
//   modelRecord: ModelRecord
// ): E.Either<NEA.NonEmptyArray<Error>, t.Mixed> => {
//   return pipe(
//     modelRecord,
//     R.lookup(typeName),
//     E.fromOption(() => NEA.of(new Error(`No match found for type ${typeName}`)))
//   )
// }

// interface IOTSSchema<S> {
//   traverseExactType: <C extends t.Props>(
//     ioType: t.ExactType<t.InterfaceType<C>>
//   ) => E.Either<NEA.NonEmptyArray<Error>, Record<keyof C, S>>
//   traverseAnyType: <C extends t.Props>(
//     ioType:
//       | t.RecursiveType<t.ExactType<t.InterfaceType<C>>>
//       | t.UnionType<[t.ExactType<t.InterfaceType<C>>]>
//       | t.ExactType<t.InterfaceType<C>>
//   ) => E.Either<NEA.NonEmptyArray<Error>, Record<string, Record<keyof C, S>>>
// }

// interface GetIOTSToSchemaProps<C, S> {
//   models: typeof Models
//   schema: IOTSSchemable<C, S>
// }

// export const GetIOTSToSchema = <C, S>(
//   opts: GetIOTSToSchemaProps<C, S>
// ): IOTSSchema<S> => {
//   const modelsRecord = {
//     ...opts.models.Common,
//     ...opts.models.Frontmatter,
//     [nonEmptyArray(opts.models.Common.ImageSource).name]: nonEmptyArray(
//       opts.models.Common.ImageSource
//     ),
//     [nonEmptyArray(JSONFromString.pipe(opts.models.Common.Polygon)).name]: nonEmptyArray(JSONFromString.pipe(opts.models.Common.Polygon)),
//     [JSONFromString.pipe(opts.models.Common.Polygon).name]: JSONFromString.pipe(opts.models.Common.Polygon),
//     [JSONFromString.pipe(opts.models.Common.Point).name]: JSONFromString.pipe(
//       opts.models.Common.Point
//     ),
//     [t.array(opts.models.Frontmatter.GroupFrontmatter).name]: t.array(
//       opts.models.Frontmatter.GroupFrontmatter
//     ),
//     [t.array(opts.models.Frontmatter.ActorFrontmatter).name]: t.array(
//       opts.models.Frontmatter.ActorFrontmatter
//     ),
//     [t.array(t.string).name]: t.array(t.string),
//     [t.array(opts.models.Common.ImageSource).name]: t.array(
//       opts.models.Common.ImageSource
//     ),
//     [DateFromISOString.name]: DateFromISOString,
//     string: t.string,
//     number: t.number,
//   }

//   const traverseExactType = <P extends t.Props>(
//     ioType: t.ExactType<t.InterfaceType<P>>
//   ): E.Either<NEA.NonEmptyArray<Error>, { [key in keyof P]: S }> => {
//     const loop = <P extends t.Props>(
//       acc: { [key in keyof P]: S },
//       key: string,
//       type: t.Mixed | t.InterfaceType<P>,
//       context: C
//     ): E.Either<NEA.NonEmptyArray<Error>, { [key in keyof P]: S }> => {
//       if (isRecursiveType(type)) {
//         return loop(acc, key, type.type, context)
//       }

//       if (isArrayType(type)) {
//         return loop(acc, key, type.type, opts.schema.isArray(key, context))
//       }

//       // console.log({key, type})

//       // Option
//       const optionMatch = type.name.match(/Option<(.*?)>/)
//       // const optionMatch = type.name.match(/Option<(\w+)>|Option<(\w+<(\w+)>)>/)
//       if (optionMatch !== null) {
//         const firstBadThing = type.name.replace("Option<", "")
//         const newKey = firstBadThing.substr(0, firstBadThing.length - 1)
//         const newType = getTypeByName(newKey, modelsRecord)

//         return pipe(
//           newType,
//           E.chain((type) => loop(acc, key, type, opts.schema.isOption(key, context)))
//         )
//       }

//       // NonEmptyArray

//       const neaMatch = type.name.match(/NonEmptyArray<(.*?)>/)

//       if (neaMatch !== null) {
//         // console.log(neaMatch)
//         const newKeyPartial = type.name.replace("NonEmptyArray<", "")
//         const newKey = newKeyPartial.substr(0, newKeyPartial.length - 1)
//         return pipe(
//           getTypeByName(newKey, modelsRecord),
//           E.chain((type) =>
//             loop(acc, key, type, opts.schema.isNonEmptyArray(key, context))
//           )
//         )
//       }

//       if (type.name === ProjectFrontmatter.name) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isProjectFrontmatter(key, context),
//         })
//       }

//       if (type.name === TransactionFrontmatter.name) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isTransactionFrontmatter(key, context),
//         })
//       }

//       if (type.name === ActorFrontmatter.name) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isActorFrontmatter(key, context),
//         })
//       }

//       if (type.name === GroupFrontmatter.name) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isGroupFrontmatter(key, context),
//         })
//       }

//       if (type.name === TopicFrontmatter.name) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isTopicFrontmatter(key, context),
//         })
//       }

//       if (isGroupKind(type)) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isGroupKind(key, context),
//         })
//       }

//       if (isByGroupOrActor(type)) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isByGroupOrActor(key, context),
//         })
//       }

//       if (isCurrency(type)) {
//         return E.right({
//           ...acc, [key]: opts.schema.isString(key, context)
//         })
//       }

//       if (isMoneyAmount(type)) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isMoneyAmount(key, context),
//         })
//       }

//       if (isFor(type)) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isFor(key, context),
//         })
//       }

//       // if (isImpact(type)) {
//       //   return E.right({
//       //     ...acc,
//       //     [key]: opts.schema.isImpact(key, props),
//       //   })
//       // }

//       if (type.name === "ImageSource") {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isImageSource(key, context),
//         })
//       }

//       if (type.name === "ImageFileNode") {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isImageFileNode(key, context),
//         })
//       }

//       if (isLiteralType(type)) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isLiteral(key, context),
//         })
//       }

//       if (isBooleanType(type)) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isBoolean(key, context),
//         })
//       }

//       if (type.name === "ColorType") {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isString(key, context),
//         })
//       }

//       if (type.name === "DateFromISOString") {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isDateFromISOString(key, context),
//         })
//       }

//       if (
//         type.name === "pipe(JSONFromString, Polygon)" ||
//         type.name === "Polygon"
//       ) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isPolygon(key, context),
//         })
//       }

//       if (
//         type.name === "pipe(JSONFromString, Point)" ||
//         type.name === "Point"
//       ) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isPoint(key, context),
//         })
//       }

//       if (isStringType(type)) {
//         console.log({ key, type, props: context})
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isString(key, context),
//         })
//       }

//       if (isNumberType(type)) {
//         return E.right({
//           ...acc,
//           [key]: opts.schema.isNumber(key, context),
//         })
//       }

//       return E.right(acc)
//     }

//     const init: { [key in keyof P]: S } = {} as any

//     return pipe(
//       traverseR(ioType.type.props, (key, prop) =>
//         loop(init, key, prop, opts.schema.getDefaultProps())
//       ),
//       E.map(R.reduce(init, (acc, r) => ({ ...acc, ...r })))
//     )
//   }

//   const traverseAnyType = <C extends t.Props>(
//     ioType:
//       | t.RecursiveType<t.ExactType<t.InterfaceType<C>>>
//       | t.UnionType<[t.ExactType<t.InterfaceType<C>>]>
//       | t.ExactType<t.InterfaceType<C>>
//   ): E.Either<NEA.NonEmptyArray<Error>, Record<string, Record<keyof C, S>>> => {
//     if (isRecursiveType(ioType)) {
//       return pipe(
//         traverseExactType(ioType.type),
//         E.map((schema) => ({
//           [ioType.type.name]: schema,
//         }))
//       )
//     }

//     if (isUnionType(ioType)) {
//       const init: Record<
//         string,
//         E.Either<NEA.NonEmptyArray<Error>, Record<keyof C, S>>
//       > = {}
//       return pipe(
//         ioType.types,
//         A.reduce(init, (acc, type) => ({
//           ...acc,
//           [type.name]: traverseExactType(type),
//         })),
//         R.sequence(E.getValidation(NEA.getSemigroup<Error>()))
//       )
//     }

//     return pipe(
//       traverseExactType(ioType),
//       E.map((schema) => ({ [ioType.name]: schema }))
//     )
//   }

//   return {
//     traverseExactType,
//     traverseAnyType,
//   }
// }
