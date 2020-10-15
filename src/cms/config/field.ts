import { CmsField as NCMSField } from "netlify-cms-core"

export interface CmsField extends Omit<NCMSField, "name" | "label"> {
  name: string
  label?: string
}

export type GetField<R extends Partial<CmsField>> = (field: R) => CmsField

const makeField = <R extends keyof CmsField>(
  obj: { widget: string } & Partial<CmsField>
): GetField<Pick<CmsField, R> & CmsField> => (field) => ({
  ...field,
  ...obj,
})
/**
 * Fields
 */

export const BooleanField = makeField({
  widget: "boolean",
  default: false,
})
export const DateField = makeField({
  widget: "datetime",
})

export const ImageField = makeField({
  label: "Image",
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
  widget: "number",
})

export const RelationField = makeField({
  widget: "relation",
  value_field: "uuid",
})
export const StringField = makeField({
  widget: "string",
})

export const TextField = makeField({
  label: "Title",
  name: "text",
  widget: "text",
})

export const VideoField = makeField({
  label: "Video",
  name: "video",
  widget: "file",
})

export const ColorField = makeField({
  widget: "color",
})

export const UUIDField: CmsField = {
  label: "uuid",
  name: "uuid",
  widget: "uuid",
}

export const PolygonField = makeField<'type'>({
  widget: "map",
})

export const ListField = makeField<"field">({
  widget: "list",
})

export const SelectField = makeField<"options">({
  widget: "select",
  value_field: 'uuid'
})
