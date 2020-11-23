import { IOTSTOCMSFields } from "@cms/utils"
import { TopicFrontmatter } from "@models/topic"
import { CmsCollection } from "netlify-cms-core"

export const topics: CmsCollection = {
  name: "topics",
  label: "Topic",
  folder: "content/topics",
  identifier_field: "uuid",
  media_folder: "../../static/media/topics/{{fields.uuid}}",
  create: true,
  delete: false,
  summary: "[{{fields.uuid}}] {{fields.label}}",
  fields: IOTSTOCMSFields(TopicFrontmatter),
}
