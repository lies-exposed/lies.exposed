import { IOTSTypeToCMSFields } from "@cms/utils"
import { PageFrontmatter } from "@models/page"
import { CmsCollection } from "netlify-cms-core"

export const pages: CmsCollection = {
  name: "pages",
  label: "Page",
  folder: "content/pages",
  media_folder: "../../static/media/pages/{{slug}}",
  create: true,
  fields: IOTSTypeToCMSFields(PageFrontmatter),
  // fields: [
  //   StringField({ label: "Title", name: "title" }),
  //   StringField({ label: "path", name: "path" }),
  //   DateField({ label: "Date", name: "date" }),
  //   MarkdownField({ name: "body", label: "body" }),
  // ],
}
