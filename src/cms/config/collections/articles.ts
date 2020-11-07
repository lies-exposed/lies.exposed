import { IOTSTOCMSFields } from "@cms/utils"
import { ArticleFrontmatter } from "@models/article"
import { CmsCollection } from "netlify-cms-core"

export const articles: CmsCollection = {
  name: "articles",
  label: "Articoli",
  label_singular: "Articolo",
  folder: "content/articles",
  media_folder: "../../static/media/articles/{{fields.uuid}}",
  create: true,
  slug: "{{fields.uuid}}",
  fields: IOTSTOCMSFields(ArticleFrontmatter),
}
