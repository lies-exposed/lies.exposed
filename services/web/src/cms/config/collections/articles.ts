import { IOTSTOCMSFields } from "@cms/config/utils"
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
  // view_groups: [
  //   {
  //     label: "Drafts",
  //     field: "draft",
  //   },
  // ],
  fields: IOTSTOCMSFields(ArticleFrontmatter),
}
