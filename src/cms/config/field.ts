import { CmsField as NCMSField } from "netlify-cms-core"

export interface CmsField extends Omit<NCMSField, "label"> {
  label: string
}

type GetField = (field: Partial<CmsField>) => CmsField

const makeField = (
  obj: { name: string; label: string; widget: string } & Partial<CmsField>
): GetField => (field) => ({
  ...obj,
  ...field,
})
/**
 * Fields
 */

export const BooleanField = makeField({
  widget: "boolean",
  name: 'boolean',
  label: 'boolean',
  default: false,
})
export const DateField = makeField({
  label: "Date",
  name: "date",
  widget: "datetime",
})

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

export const NumberField = makeField({
  label: "Number",
  name: 'number',
  widget: "number",
})

export const RelationField = makeField({
  widget: "relation",
  name: 'relation',
  label: 'Relation',
  valueField: "uuid",
})
export const StringField = makeField({
  label: "Title",
  name: 'string',
  widget: "string",
})

export const TextField = makeField({
  label: "Title",
  name: 'text',
  widget: "text",
})

export const VideoField = makeField({
  label: "Video",
  name: "video",
  widget: "file",
})

export const ColorField = {
  label: "Color",
  name: "color",
  widget: "color",
}

export const UUIDField: CmsField = {
  label: "uuid",
  name: "uuid",
  widget: "uuid",
}

export const PolygonField = makeField({
  label: "Polygon",
  name: "polygon",
  widget: "map",
  type: "Polygon",
})
