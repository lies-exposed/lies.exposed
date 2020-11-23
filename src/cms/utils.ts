import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { For } from "@models/Common/For"
import { MoneyAmount } from "@models/Common/MoneyAmount"
import { ImageFileNode, ImageSource } from "@models/Image"
import { ProjectFrontmatter } from "@models/Project"
import { TransactionFrontmatter } from "@models/Transaction"
import { ActorFrontmatter } from "@models/actor"
import { GroupFrontmatter } from "@models/group"
import { Models } from "@models/index"
import { TopicFrontmatter } from "@models/topic"
import { GetIOTSToSchema, IOTSSchemable } from "@utils/IOTSSchemable"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Ord from "fp-ts/lib/Ord"
import * as R from "fp-ts/lib/Record"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { CmsCollection, CmsField } from "netlify-cms-core"
import {
  BooleanField,
  ColorField,
  DateField,
  ImageField,
  ListField,
  MapField,
  NumberField,
  RelationField,
  SelectField,
  StringField,
  UUIDField,
} from "./config/field"

const camelCaseToSentenceCase = (str: string): string => {
  // adding space between strings
  const result = str.replace(/([A-Z])/g, " $1")

  // converting first character to uppercase and join it to the final string
  const final = result.charAt(0).toUpperCase() + result.slice(1)
  return final
}

type GetRelationField = (name: string, field: Partial<CmsField>) => CmsField

const groupRelationField: GetRelationField = (name, field) =>
  RelationField({
    name,
    label: camelCaseToSentenceCase(name),
    collection: "groups",
    search_fields: ["uuid"],
    display_fields: ["name"],
    value_field: "uuid",
    ...field,
  })

const actorRelationField: GetRelationField = (name, field) =>
  RelationField({
    label: camelCaseToSentenceCase(name),
    name: name,
    collection: "actors",
    search_fields: ["uuid"],
    display_fields: ["fullName"],
    value_field: "uuid",
    ...field,
  })

const topicRelationField: GetRelationField = (name, field) =>
  RelationField({
    label: camelCaseToSentenceCase(name),
    name: name,
    collection: "topics",
    search_fields: ["uuid"],
    display_fields: ["label"],
    value_field: "uuid",
    ...field,
  })

const projectRelationField: GetRelationField = (name, field) =>
  RelationField({
    label: camelCaseToSentenceCase(name),
    name: name,
    collection: "projects",
    search_fields: ["uuid", "name"],
    display_fields: ["name"],
    value_field: "uuid",
    ...field,
  })

const transactionRelationField: GetRelationField = (name, field) =>
  RelationField({
    label: camelCaseToSentenceCase(name),
    name: name,
    collection: "transactions",
    search_fields: ["uuid"],
    display_fields: ["uuid"],
    value_field: "uuid",
    ...field,
  })

const getTypeByName = (name: string): t.Mixed => {
  switch (name) {
    case ProjectFrontmatter.name: {
      return ProjectFrontmatter
    }
    case ActorFrontmatter.name: {
      return ActorFrontmatter
    }
    case GroupFrontmatter.name: {
      return GroupFrontmatter.type
    }
    case ImageSource.name: {
      return ImageSource
    }
    case ByGroupOrActor.name: {
      return ByGroupOrActor
    }
    case TopicFrontmatter.name: {
      return TopicFrontmatter
    }
    case ImageFileNode.name: {
      return ImageFileNode
    }
    case DateFromISOString.name: {
      return DateFromISOString
    }
    case t.array(t.string).name: {
      return t.array(t.string)
    }
    case t.array(ActorFrontmatter).name: {
      return t.array(ActorFrontmatter)
    }
    case t.array(GroupFrontmatter).name: {
      return t.array(GroupFrontmatter)
    }
    case t.array(ImageSource).name: {
      return t.array(ImageSource)
    }
    case nonEmptyArray(ImageSource).name: {
      return nonEmptyArray(ImageSource)
    }
    case t.string.name: {
      return t.string
    }

    default:
      // eslint-disable-next-line no-console
      console.error(name)
      return ActorFrontmatter
  }
}

const isBooleanType = (io: unknown): io is t.BooleanType =>
  (io as any)._tag !== undefined && (io as any)._tag === "BooleanType"

const isStringType = (io: unknown): io is t.StringType =>
  (io as any)._tag !== undefined && (io as any)._tag === "StringType"

const isNumberType = (io: unknown): io is t.NumberType =>
  (io as any)._tag !== undefined && (io as any)._tag === "NumberType"

const isUnionType = (io: unknown): io is t.UnionType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "UnionType"

const isLiteralType = (io: unknown): io is t.LiteralType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "LiteralType"

const isRecursiveType = (io: unknown): io is t.RecursiveType<t.Any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "RecursiveType"

const isArrayType = (io: unknown): io is t.ArrayType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "ArrayType"

const isByGroupOrActor = (props: any): props is typeof ByGroupOrActor => {
  return isUnionType(props) && props.name === ByGroupOrActor.name
}

const isFor = (props: any): props is typeof For => {
  return isUnionType(props) && props.name === For.name
}

const isMoneyAmount = (props: t.Mixed): props is typeof MoneyAmount => {
  return props.name === MoneyAmount.name
}

const isImpact = (
  props: any
): props is t.UnionType<Array<t.InterfaceType<any>>> => {
  return isUnionType(props) && props.name === "Impact"
}

const fieldsSorter = A.sort(
  Ord.ord.contramap(Ord.ordNumber, (f: CmsField) => {
    return (
      [
        "uuid",
        "type",
        "title",
        "label",
        "name",
        "lastName",
        "fullName",
        "slug",
        "path",
        "date",
        "startDate",
        "endDate",
        "color",
        "avatar",
        "images",
        "featuredImage",
        "for",
        "members",
        "subGroups",
        "by",
        "publishedBy",
        "links",
        "body",
        "createdAt",
        "updatedAt",
      ].indexOf(f.name) ?? 0
    )
  })
)

const IOTSToCMSSchema: IOTSSchemable<CmsField, CmsField> = {
  getDefaultProps() {
    return {
      name: "uuid",
    }
  },
  isArray(props) {
    return {
      ...props,
      widget: "list",
      multiple: true,
    }
  },
  isOption(props) {
    return { ...props, required: false }
  },
  isNonEmptyArray(props) {
    return { ...props, required: true, widget: "list" }
  },
  isGroupFrontmatter(key, props) {
    return groupRelationField(key, props)
  },
  isActorFrontmatter(key, props) {
    return actorRelationField(key, props)
  },
  isTopicFrontmatter(key, props) {
    return topicRelationField(key, props)
  },
  isGroupKind(key, props) {
    return { ...props, name: key }
  },
  isByGroupOrActor(key, props) {
    // console.log("is by group or actor")
    return {
      ...props,
      name: key,
      label: key,
      types: [
        {
          name: "Actor",
          fields: [actorRelationField("actor", { multiple: false })],
        },
        {
          name: "Group",
          fields: [groupRelationField("group", { multiple: false })],
        },
      ],
      widget: "list",
    }
  },
  isByActor(key, props) {
    return { ...props, name: key }
  },
  isByGroup(key, props) {
    return { ...props, name: key }
  },
  isImpact(key, props) {
    return ListField({
      ...props,
      name: key,
      label: key,
      types: [{ name: "ImpactName" }].map((type) => ({
        name: type.name,
        label: type.name,
        // TODO: check for type of impact
        // fields: traverseStruct([])(type.name, type, {}),
        fields: [StringField({ name: type.name })],
      })),
    })
  },
  isFor(key, props) {
    return {
      ...props,
      multiple: false,
      name: key,
      label: key,
      types: [
        {
          name: "Project",
          label: "Project",
          fields: [
            projectRelationField("project", {
              multiple: false,
              required: true,
            }),
          ],
        },
        {
          name: "ForEvent",
          label: "ForEvent",
          fields: [
            projectRelationField("uuid", { multiple: false, required: true }),
          ],
        },
      ],
      widget: "list",
    }
  },
  isForGroup(key, props) {
    return { ...props, key }
  },
  isForProject(key, props) {
    return { ...props, key }
  },
  isLiteral(key, props) {
    return StringField({ ...props, name: key })
  },
  isMoneyAmount(key, props) {
    return {
      ...props,
      name: key,
      label: key,
      widget: "object",
      fields: [
        NumberField({ name: "amount" }),
        SelectField({
          name: "currency",
          options: ["euro", "dollar"],
        }),
      ],
    }
  },
  isPolygon(key, props) {
    return MapField({ ...props, name: key, label: key, type: "Polygon" })
  },
  isPoint(key, props) {
    return MapField({ ...props, name: key, label: key, type: "Point" })
  },
  isProjectFrontmatter(key, props) {
    return projectRelationField(key, props)
  },
  isTransactionFrontmatter(key, props) {
    return transactionRelationField(key, props)
  },
  isImageSource(key, props) {
    return {
      ...props,
      name: key,
      label: key,
      collapsed: true,
      fields: [
        ImageField({ label: "Image", name: "image" }),
        StringField({
          label: "Description",
          name: "description",
          required: false,
        }),
        StringField({ label: "Author", name: "author" }),
      ],
    }
  },
  isImageFileNode(key, props) {
    return ImageField({ name, label: key })
  },
  isDateFromISOString(key, props) {
    return DateField({ ...props, name: key })
  },
  isNumber(key, props) {
    return NumberField({ ...props, name: key, label: key })
  },
  isBoolean(key, props) {
    return BooleanField({ ...props, label: key, name: key })
  },
  isString(key, props) {
    if (key === "uuid") {
      return UUIDField({ widget: "hidden" })
    }
    if (key === "color") {
      return ColorField({ name: key, label: key })
    }
    return StringField({
      name: key,
      label: camelCaseToSentenceCase(key),
    })
  },
}

const IOTSCMSSchema = GetIOTSToSchema({
  models: Models,
  schema: IOTSToCMSSchema,
})

export const IOTSTOCMSFields = (i: t.Mixed): any => {
  return pipe(
    IOTSCMSSchema.traverseAnyType(i as any),
    E.map((result) => result[i.name]),
    E.map(
      R.reduceWithIndex(
        [{ label: "Body", name: "body", widget: "markdown" }] as CmsField[],
        (key, acc, field) => acc.concat({ ...field, name: key })
      )
    ),
    E.map(fieldsSorter),
    E.getOrElse((e): CmsField[] => {
      // eslint-disable-next-line no-console
      console.error(e)
      return []
    })
  )
}

export const IOTSTypeToCMSFields = <T extends t.Props>(
  ioType: t.ExactType<t.InterfaceType<T>>
): CmsCollection["fields"] => {
  // console.log("type", ioType)

  const traverseStruct = (acc: CmsField[]) => <C extends t.HasProps>(
    key: string,
    props: t.Mixed | t.InterfaceType<C>,
    field: Partial<CmsField>
  ): CmsField[] => {
    const name = key
    const label = camelCaseToSentenceCase(name)

    // console.log({ key, props, field })

    if (isRecursiveType(props)) {
      return traverseStruct(acc)(name, props.type, {})
    }

    if (isArrayType(props)) {
      return acc.concat(
        traverseStruct([])(name, props.type, {
          ...field,
          widget: "list",
          multiple: true,
        })
      )
    }

    // Option

    const optionMatch = props.name.match(/Option<(\w+)>|Option<(\w+<(\w+)>)>/)
    if (optionMatch !== null) {
      // console.log({ props, optionMatch })
      const newKey = optionMatch[1] ?? optionMatch[2] ?? "fuck"
      const newProp = getTypeByName(newKey)

      // console.log({ newKey, newProp })
      return traverseStruct(acc)(name, newProp, { required: false })
    }

    // NonEmptyArray

    const neaMatch = props.name.match(
      /NonEmptyArray<(\w+)>|NonEmptyArray<(\w+<(\w+)>)>/
    )

    if (neaMatch !== null) {
      // console.log(neaMatch)
      const newKey = neaMatch[2] ?? neaMatch[1]
      const newProp = getTypeByName(newKey)

      // console.log({ newKey, newProp })
      return traverseStruct(acc)(name, newProp, {
        required: true,
        widget: "list",
      })
    }

    if (props.name === ProjectFrontmatter.name) {
      return acc.concat(projectRelationField(key, field))
    }

    if (props.name === TransactionFrontmatter.name) {
      return acc.concat(transactionRelationField(key, field))
    }

    if (props.name === ActorFrontmatter.name) {
      return acc.concat({
        ...field,
        ...actorRelationField(name, field),
      })
    }

    if (props.name === GroupFrontmatter.name) {
      return acc.concat(groupRelationField(name, field))
    }

    if (props.name === TopicFrontmatter.name) {
      return acc.concat(topicRelationField(name, field))
    }

    if (isByGroupOrActor(props)) {
      return acc.concat({
        name,
        label,
        types: [
          {
            name: "Actor",
            fields: [actorRelationField("actor", { multiple: false })],
          },
          {
            name: "Group",
            fields: [groupRelationField("group", { multiple: false })],
          },
        ],
        ...field,
        widget: "list",
      })
    }

    if (isMoneyAmount(props)) {
      return acc.concat({
        ...field,
        name,
        label,
        widget: "object",
        fields: [
          NumberField({ name: "amount" }),
          SelectField({
            name: "currency",
            options: props.type.props.currency.types.map((t) => t.value),
          }),
        ],
      })
    }

    if (isFor(props)) {
      return acc.concat({
        multiple: false,
        name: key,
        label: label,
        types: [
          {
            name: "Project",
            label: "Project",
            fields: [
              projectRelationField("project", {
                multiple: false,
                required: true,
              }),
            ],
          },
          {
            name: "ForEvent",
            label: "ForEvent",
            fields: [
              projectRelationField("uuid", { multiple: false, required: true }),
            ],
          },
        ],
        widget: "list",
        ...field,
      })
    }

    if (isImpact(props)) {
      return acc.concat(
        ListField({
          ...field,
          name,
          label,
          types: props.types.map((type) => ({
            name: type.name,
            label: type.name,
            // TODO: check for type of impact
            // fields: traverseStruct([])(type.name, type, {}),
            fields: [StringField({ name: type.name })],
          })),
        })
      )
    }

    if (props.name === "ImageSource") {
      return acc.concat({
        ...field,
        name,
        label,
        collapsed: true,
        fields: [
          ImageField({ label: "Image", name: "image" }),
          StringField({
            label: "Description",
            name: "description",
            required: false,
          }),
          StringField({ label: "Author", name: "author" }),
        ],
      })
    }

    if (props.name === "ImageFileNode") {
      return acc.concat(ImageField({ name, label }))
    }

    if (isLiteralType(props)) {
      if (key === "type") {
        return acc.concat({
          name: "type",
          widget: "hidden",
          default: props.value,
        })
      }
    }

    if (isBooleanType(props)) {
      return acc.concat(BooleanField({ label, name }))
    }

    if (props.name === "ColorType") {
      return acc.concat(ColorField({ name, label }))
    }

    if (props.name === "DateFromISOString") {
      return acc.concat(DateField({ name: key, label: label }))
    }

    if (
      props.name === "pipe(JSONFromString, Polygon)" ||
      props.name === "Polygon"
    ) {
      return acc.concat(MapField({ name, label, type: "Polygon" }))
    }

    if (isStringType(props)) {
      return acc.concat(
        key === "uuid"
          ? UUIDField({ widget: "hidden" })
          : StringField({
              name: key,
              label: camelCaseToSentenceCase(key),
            })
      )
    }

    if (isNumberType(props)) {
      return acc.concat(NumberField({ name: key, label: label }))
    }

    // console.log({ key, props })

    return acc
  }

  return pipe(
    ioType.type.props,
    R.mapWithIndex((index, io) => traverseStruct([])(index, io, {})),
    R.toArray,
    A.map(([key, field]) => field),
    A.flatten,
    (fields) =>
      fields.concat({ label: "Body", name: "body", widget: "markdown" }),
    fieldsSorter
    // logInPipe("fields")
  )
}
