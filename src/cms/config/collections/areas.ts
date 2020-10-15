import {
  ColorField,
  DateField,
  PolygonField,
  RelationField,
  StringField,
  UUIDField,
} from "@cms/config/field"
import { CmsCollection } from "netlify-cms-core"

export const areas: CmsCollection = {
  name: "areas",
  label: "Area",
  folder: "content/areas",
  identifier_field: "uuid",
  media_folder: "../../static/media/areas/{{fields.uuid}}",
  create: true,
  delete: false,
  summary: "[{{fields.uuid}}] {{fields.label}}",
  // fields: IOTSTypeToCMSFields(AreaFrontmatter)
  fields: [
    UUIDField,
    StringField({ label: "Label", name: "label" }),
    ColorField({ name: "color", label: "Color" }),
    RelationField({
      name: "groups",
      label: "Groups",
      collection: "groups",
      search_fields: ["name", "uuid"],
      display_fields: ["name"],
      value_field: "uuid",
      multiple: true,
    }),
    RelationField({
      name: "topics",
      label: "Topics",
      collection: "topics",
      search_fields: ["label", "uuid"],
      display_fields: ["label"],
      value_field: "uuid",
      multiple: true,
    }),
    DateField({ name: "date", label: "Date" }),
    PolygonField({ name: "polygon", label: "Polygon" }),
  ],
}
