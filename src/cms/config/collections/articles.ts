import { IOTSTypeToCMSFields } from "@cms/utils"
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
  fields: IOTSTypeToCMSFields(ArticleFrontmatter),
  // fields: [
  //   UUIDField,
  //   BooleanField({ label: "Draft", name: "draft" }),
  //   StringField({ label: "Title", name: "title" }),
  //   StringField({ label: "Path", name: "path" }),
  //   ImageField({ label: "Featured Image", name: "featuredImage" }),
  //   { label: "Publish Date", name: "date", widget: "datetime" },
  //   MarkdownField({ name: "body", label: "body" }),
  // ],
}
