import { Project } from "@models/Project";
import { IOTSTypeToCMSFields } from "cms/utils";
import { CmsCollection } from "netlify-cms-core"


const fields = IOTSTypeToCMSFields(Project)

console.log(fields)

export const projects: CmsCollection = {
  name: "projects",
  label: "Project",
  label_singular: "Project",
  folder: "content/projects",
  media_folder: "../../static/media/projects/{{fields.uuid}}",
  summary: "[{{fields.uuid}}] {{fields.name}}",
  slug: "{{fields.uuid}}",
  create: true,
  fields,
}