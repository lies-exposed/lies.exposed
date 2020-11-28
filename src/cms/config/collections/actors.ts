import { IOTSTOCMSFields } from "@cms/config/utils"
import { ActorFrontmatter } from "@models/actor"
import { CmsCollection } from "netlify-cms-core"

export const actors: CmsCollection = {
  name: "actors",
  label: "Actor",
  slug: "{{fields.uuid}}",
  folder: "content/actors",
  media_folder: "../../static/media/actors/{{fields.uuid}}",
  create: true,
  fields: IOTSTOCMSFields(ActorFrontmatter),
}
