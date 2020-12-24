import { IOTSTOCMSFields } from "@cms/config/utils"
import { ProjectFrontmatter } from "@models/Project"
import { CmsCollection } from "netlify-cms-core"

export const projects: CmsCollection = {
  name: "projects",
  label: "Project",
  label_singular: "Project",
  folder: "content/projects",
  media_folder: "../../static/media/projects/{{fields.uuid}}",
  summary: "[{{fields.uuid}}] {{fields.name}}",
  slug: "{{fields.uuid}}",
  create: true,
  fields: IOTSTOCMSFields(ProjectFrontmatter)
}
