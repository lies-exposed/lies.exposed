import { IOTSTOCMSFields } from "@cms/utils"
import { AreaFrontmatter } from "@models/area"
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
  fields: IOTSTOCMSFields(AreaFrontmatter)
}
