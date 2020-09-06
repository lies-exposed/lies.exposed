import { CmsField } from "netlify-cms-core"

export interface CmsFieldV2 extends CmsField {
  collection?: string
  searchFields?: string[]
  displayFields?: string[]
  valueField?: string
  multiple?: boolean
  options?: string[]
  collapsed?: boolean
  summary?: string
  field?: CmsFieldV2
  fields?: CmsFieldV2[]
  format?: string
  default?: string | { label: string; value: string } | number
  types?: CmsFieldV2[]
  valueType?: "int"
  min?: number
  max?: number
}

type GetField = (field: Partial<CmsFieldV2>) => CmsFieldV2

const makeField = (obj: Partial<CmsFieldV2>): GetField => (field) =>
  ({
    ...obj,
    ...field,
  } as any)

/**
 * Fields
 */
export const ImageField = makeField({
  label: "Image",
  name: "image",
  widget: "image",
})

export const MapField = makeField({
  label: "Map",
  summary: "Map",
  name: "map",
  widget: "map",
})

export const MarkdownField = makeField({
  label: "Body",
  name: "body",
  widget: "markdown",
})

export const DateField = makeField({
  label: "Date",
  name: "date",
  widget: "datetime",
})

export const NumberField = makeField({
  label: "Number",
  widget: "number",
})

export const RelationField = makeField({
  widget: "relation",
})
export const StringField = makeField({
  label: "Title",
  widget: "string",
})

export const TextField = makeField({
  label: "Title",
  widget: "text",
})

export const VideoField = makeField({
  label: "Video",
  name: "video",
  widget: "file",
})

export const ColorField: GetField = (field) =>
  StringField({
    label: "Color",
    name: "color",
    widget: "color",
    ...field,
  })
