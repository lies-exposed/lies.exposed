import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { EventMap as EventTypeKeys, For } from "@models/events/EventMetadata"
import * as A from "fp-ts/lib/Array"
import * as R from "fp-ts/lib/Record"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
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

const groupRelationField = (name: string): CmsField =>
  RelationField({
    name: name,
    label: camelCaseToSentenceCase(name),
    collection: "groups",
    search_fields: ["uuid"],
    display_fields: ["name"],
    value_field: "uuid",
    multiple: true,
  })

const actorRelationField = (name: string): CmsField =>
  RelationField({
    label: camelCaseToSentenceCase(name),
    name: name,
    collection: "actors",
    search_fields: ["uuid"],
    display_fields: ["fullName"],
    value_field: "uuid",
    multiple: true,
  })

const topicRelationField = (name: string): CmsField =>
  RelationField({
    label: camelCaseToSentenceCase(name),
    name: name,
    collection: "topics",
    search_fields: ["uuid"],
    display_fields: ["label"],
    value_field: "uuid",
    multiple: true,
  })

const projectRelationField = (name: string): CmsField =>
  RelationField({
    label: camelCaseToSentenceCase(name),
    name: name,
    collection: "projects",
    search_fields: ["uuid", "name"],
    display_fields: ["name"],
    value_field: "uuid",
    multiple: true,
  })

const transactionRelationField = (name: string): CmsField =>
  RelationField({
    label: camelCaseToSentenceCase(name),
    name: name,
    collection: "transactions",
    search_fields: ["uuid"],
    display_fields: ['uuid'],
    value_field: "uuid",
    multiple: true,
  })

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

const isInterfaceType = (io: unknown): io is t.InterfaceType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "InterfaceType"

const isArrayType = (io: unknown): io is t.ArrayType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "ArrayType"

const isExactType = (io: unknown): io is t.ExactType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "ExactType"

const isByGroupOrActor = (props: any): props is ByGroupOrActor => {
  return isUnionType(props) && props.name === ByGroupOrActor.name
}

const isFor = (props: any): props is For => {
  return isUnionType(props) && props.name === For.name
}

const isImpact = (
  props: any
): props is t.UnionType<Array<t.InterfaceType<any>>> => {
  return isUnionType(props) && props.name === "Impact"
}

export const IOTSTypeToCMSFields = <T extends t.Props>(
  ioType: t.ExactType<t.InterfaceType<T>>
): CmsCollection["fields"] => {
  // console.log("type", ioType)

  const traverseStruct = (acc: CmsField[]) => <C extends t.HasProps>(
    key: string,
    props: t.Mixed | t.InterfaceType<C>
  ): CmsField[] => {
    const name = key
    const label = camelCaseToSentenceCase(name)

    // console.log({ key, props })

    if (isLiteralType(props)) {
      if (key === "type") {
        return acc.concat({
          name: "type",
          widget: "hidden",
          default: props.value,
        })
      }
    }

    if (isRecursiveType(props)) {
      return traverseStruct(acc)(name, props.type)
    }

    if (isExactType(props)) {
      if (props.name === "Polygon") {
        return acc.concat(MapField({ name, label, type: "Polygon" }))
      }

      if (props.name === 'ProjectFrontmatter') {
        return acc.concat(projectRelationField(key))
      }

      if (props.name === 'TransactionFrontmatter') {
        return acc.concat(transactionRelationField(key))
      }

      return acc.concat(traverseStruct([])(name, props.type))
    }

    if (isInterfaceType(props)) {
      if (props.name === "ImageFileNode") {
        return acc.concat(ImageField({ name, label }))
      }

      return pipe(
        props.props,
        R.mapWithIndex(traverseStruct([])),
        R.toArray,
        A.map(([_, field]) => field),
        A.flatten,
        (fields) => acc.concat(fields)
      )
    }

    if (isArrayType(props)) {
      if (isExactType(props.type)) {
        if (props.type.name === "Polygon") {
          return acc.concat([
            {
              name,
              label,
              widget: "list",
              search_fields: ["uuid"],
              value_field: "uuid",
              field: MapField({
                name,
                label,
              }),
            },
          ])
        }
      }

      if (props.name === "Array<pipe(JSONFromString, Polygon)>") {
        return acc.concat(
          ListField({
            name,
            label,
            multiple: true,
            field: MapField({ name, label, type: "Polygon" }),
          })
        )
      }

      if (props.name === "Array<ByEitherGroupOrActor>") {
        const type = props.type as t.UnionType<[t.Any]>
        return acc.concat(
          ListField({
            name,
            label,
            search_fields: [],
            types: type.types.map((t) => ({
              name: t.name,
              fields: traverseStruct([])(name, t),
            })),
          })
        )
      }

      if (props.name === "Array<ImageFileNode>") {
        return acc.concat(
          ListField({
            name,
            label,
            search_fields: [],
            multiple: true,
            field: ImageField({ name, label }),
          })
        )
      }

      // console.log(props)

      if (props.name === "Array<EventMetadata>" && isUnionType(props.type)) {
        const type = props.type as t.UnionType<[t.Any]>

        return acc.concat(
          ListField({
            name,
            label,
            search_fields: [],
            multiple: true,
            types: type.types.map((t) => ({
              name: t.name,
              fields: traverseStruct([])(key, t),
            })),
          })
        )
      }

      // console.log({ key, props })

      return acc.concat(
        ListField({
          name,
          label,
          search_fields: ["uuid"],
          value_field: "uuid",
          fields: traverseStruct([])(key, props.type),
        })
      )
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

    const optionMatch = props.name.match(/Option<(\w+)>|Option<(\w+<(\w+)>)>/)

    if (optionMatch !== null) {
      switch (optionMatch[1]) {
        case "string":
          return acc.concat([
            StringField({
              name,
              label,
              required: false,
            }),
          ])
        case "ImageFileNode":
          return acc.concat([
            ImageField({
              name,
              label,
              required: false,
            }),
          ])
        case "DateFromISOString":
          return acc.concat([
            DateField({
              name,
              label,
              required: false,
            }),
          ])
        case "EventType":
          return acc.concat(
            SelectField({
              name,
              label,
              options: Object.keys(EventTypeKeys),
              required: false,
            })
          )
        case "ByGroupOrActor":
          return acc.concat({
            name: key,
            label: label,
            types: [actorRelationField("Actor"), groupRelationField("Group")],
            widget: "object",
          })
      }

      switch (optionMatch[2]) {
        case "CMSRelation<actors>": {
          return acc.concat({ ...actorRelationField(name), required: false })
        }
        case "Array<string>": {
          return acc.concat(
            ListField({
              name,
              label,
              multiple: true,
              required: false,
              field: StringField({
                name,
                label,
              }),
            })
          )
        }
        case "Array<ActorFrontmatter>": {
          return acc.concat({ ...actorRelationField(name), required: false })
        }
        case "Array<Group>": {
          return acc.concat({ ...groupRelationField(name), required: false })
        }
        case "Array<ImageSource>":
          return acc.concat({
            name,
            label,
            required: false,
            collapsed: true,
            widget: "list",
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
        case "NonEmptyArray<ImageSource>": {
          return acc.concat({
            name,
            label,
            required: true,
            collapsed: true,
            widget: "list",
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
        case "NonEmptyArray<pipe(JSONFromString, Polygon)>":
          return acc.concat(
            ListField({
              name,
              label,
              required: true,
              collapsed: true,
              widget: "list",
              field: MapField({ name, label, type: "Polygon" }),
            })
          )
      }

      // console.log(optionMatch[0], { key, optionMatch })
    }

    // matches NonEmptyArray<*>
    const neaMatch = props.name.match(
      /NonEmptyArray<(\w+)>|NonEmptyArray<(\w+<(\w+)>)>/
    )
    if (neaMatch !== null) {
      switch (neaMatch[1]) {
        case "TopicFrontmatter": {
          return acc.concat(topicRelationField(key))
        }
      }
      // console.log(neaMatch[0], { key, optionMatch })
    }

    if (props.name === "Option<pipe(JSONFromString, Point)>") {
      return acc.concat(
        MapField({ name, label, type: "Point", required: false })
      )
    }

    if (props.name === "Option<NonEmptyArray<pipe(JSONFromString, Polygon)>>") {
      return acc.concat(
        ListField({
          name,
          label,
          field: MapField({ name, label, type: "Polygon", required: true }),
          required: true,
        })
      )
    }

    if (props.name === "pipe(JSONFromString, Polygon)") {
      return acc.concat(MapField({ name, label, type: "Polygon" }))
    }

    if (props.name === "Polygon") {
      return acc.concat([MapField({ name, label, type: "Polygon" })])
    }

    if (isStringType(props)) {
      if (key === "uuid") {
        return acc.concat([UUIDField])
      }
      return acc.concat([
        StringField({ name: key, label: camelCaseToSentenceCase(key) }),
      ])
    }

    if (isByGroupOrActor(props)) {
      return acc.concat([
        {
          name: key,
          label: label,
          types: [actorRelationField("Actor"), groupRelationField("Group")],
          widget: "object",
        },
      ])
    }

    if (isFor(props)) {
      return acc.concat([
        ListField({
          name: key,
          label: label,
          types: [
            {
              name: "ForProject",
              label: "Project",
              fields: [projectRelationField("ForProject")],
            },
            {
              name: "ForEvent",
              label: "ForEvent",
              fields: [projectRelationField("")],
            },
          ],
          multiple: false,
        }),
      ])
    }

    if (isImpact(props)) {
      return acc.concat(
        ListField({
          name,
          label,
          types: props.types.map((type) => ({
            name: type.name,
            label: type.name,
            fields: traverseStruct([])(type.name, type),
          })) as any,
          required: true,
          multiple: false,
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
    R.mapWithIndex(traverseStruct([])),
    R.toArray,
    A.map(([key, field]) => field),
    A.flatten,
    (fields) => {
      const fieldsWithBody = fields
        .reverse()
        .concat({ label: "Body", name: "body", widget: "markdown" })
      // console.log({ fieldsWithBody })
      return fieldsWithBody
    }
  )
}
