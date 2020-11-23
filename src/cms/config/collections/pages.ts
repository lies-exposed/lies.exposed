import { IOTSTOCMSFields } from "@cms/utils"
import { PageFrontmatter } from "@models/page"
import { CmsCollection } from "netlify-cms-core"

export const pages: CmsCollection = {
  name: "pages",
  label: "Page",
  folder: "content/pages",
  media_folder: "../../static/media/pages/{{slug}}",
  create: true,
  fields: IOTSTOCMSFields(PageFrontmatter),
}
