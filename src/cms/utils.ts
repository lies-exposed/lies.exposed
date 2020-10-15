import { EventTypeKeys } from "@models/event"
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
  PolygonField,
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
    label: camelCaseToSentenceCase(name),
    name: name,
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

const isStringType = (io: unknown): io is t.StringType =>
  (io as any)._tag !== undefined && (io as any)._tag === "StringType"

const isBooleanType = (io: unknown): io is t.BooleanType =>
  (io as any)._tag !== undefined && (io as any)._tag === "BooleanType"

const isLiteralType = (io: unknown): io is t.LiteralType<string> =>
  (io as any)._tag !== undefined && (io as any)._tag === "LiteralType"

const isInterfaceType = (io: unknown): io is t.InterfaceType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "InterfaceType"

const isArrayType = (io: unknown): io is t.ArrayType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "ArrayType"

const isExactType = (io: unknown): io is t.ExactType<any> =>
  (io as any)._tag !== undefined && (io as any)._tag === "ExactType"

export const IOTSTypeToCMSFields = <T extends t.Props>(
  ioType: t.ExactC<t.TypeC<T>>
): CmsCollection["fields"] => {
  console.log("type", ioType)

  const traverseStruct = (acc: CmsField[]) => <C extends t.HasProps>(
    key: string,
    props: t.Mixed | t.InterfaceType<C>
  ): CmsField[] => {
    const name = key
    const label = camelCaseToSentenceCase(name)

    if (isExactType(props)) {
      if (props.name === "Polygon") {
        return acc.concat([PolygonField({ name, label })])
      }

      return acc.concat(traverseStruct([])(key, props.type))
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

    if (isLiteralType(props)) {
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
              field: PolygonField({
                name,
                label,
              }),
            },
          ])
        }
      }
      return acc.concat(
        ListField({
          name,
          label,
          search_fields: ["uuid"],
          value_field: "uuid",
          fields: traverseStruct([])(props.type.name, props.type),
        })
      )
    }

    if (isBooleanType(props)) {
      return acc.concat(
        BooleanField({ label: camelCaseToSentenceCase(key), name: key })
      )
    }

    if (props.name === "ColorType") {
      return acc.concat([
        ColorField({ name: key, label: camelCaseToSentenceCase(key) }),
      ])
    }

    if (props.name === "DateFromISOString") {
      return acc.concat([
        DateField({ name: key, label: camelCaseToSentenceCase(key) }),
      ])
    }

    const optionMatch = props.name.match(/Option<(\w+)>|Option<(\w+<(\w+)>)>/)

    if (optionMatch !== null) {
      switch (optionMatch[1]) {
        case "string":
          return acc.concat([
            StringField({
              name: key,
              label: camelCaseToSentenceCase(key),
              required: false,
            }),
          ])
        case "ImageFileNode":
          return acc.concat([
            ImageField({
              name: key,
              label: camelCaseToSentenceCase(key),
              required: false,
            }),
          ])
        case "DateFromISOString":
          return acc.concat([
            DateField({
              name: key,
              label: camelCaseToSentenceCase(key),
              required: false,
            }),
          ])
        case "EventType":
          return acc.concat(
            SelectField({
              name: key,
              label: camelCaseToSentenceCase(key),
              options: Object.keys(EventTypeKeys),
              required: false
            })
          )
      }

      switch (optionMatch[2]) {
        case "CMSRelation<actors>": {
          return acc.concat(actorRelationField(key))
        }
        case "Array<string>": {
          return acc.concat(
            ListField({
              name: key,
              label: camelCaseToSentenceCase(key),
              multiple: true,
              field: StringField({
                name: key,
                label: camelCaseToSentenceCase(key),
              }),
            })
          )
        }
        case "Array<ActorFrontmatter>": {
          return acc.concat(actorRelationField(key))
        }
        case "Array<GroupFrontmatter>": {
          return acc.concat(groupRelationField(key))
        }
      }

      console.log(optionMatch[0], { key, optionMatch })
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
      console.log(neaMatch[0], { key, optionMatch })
    }

    if (props.name === "Option<pipe(ObjectFromString, Point)>") {
      return acc.concat(
        PolygonField({ name, label, type: "Point", required: false })
      )
    }

    if (props.name === "Polygon") {
      return acc.concat([PolygonField({ name, label, type: "Polygon" })])
    }

    if (isStringType(props)) {
      if (key === "uuid") {
        return acc.concat([UUIDField])
      }
      return acc.concat([
        StringField({ name: key, label: camelCaseToSentenceCase(key) }),
      ])
    }

    console.log({ key, props })

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
      console.log({ fieldsWithBody })
      return fieldsWithBody
    }
  )
}
