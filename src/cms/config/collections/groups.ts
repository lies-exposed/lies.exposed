import { IOTSTOCMSFields } from "@cms/utils";
import { GroupFrontmatter } from "@models/group";
import { CmsCollection } from "netlify-cms-core"


export const groups: CmsCollection = {
  name: "groups",
  label: "Groups",
  label_singular: "Group",
  folder: "content/groups",
  media_folder: "../../static/media/groups/{{fields.uuid}}",
  summary: "[{{fields.uuid}}] {{fields.name}}",
  slug: "{{fields.uuid}}",
  create: true,
  fields: IOTSTOCMSFields(GroupFrontmatter.type) 
}