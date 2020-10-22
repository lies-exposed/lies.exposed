import { IOTSTypeToCMSFields } from "@cms/utils";
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
  fields: IOTSTypeToCMSFields(GroupFrontmatter.type) 
  // fields: [
  //   UUIDField,
  //   StringField({ label: "Name", name: "name" }),
  //   ImageField({ label: "Avatar", name: "avatar", required: false }),
  //   ColorField({ name: "color" }),
  //   RelationField({
  //     label: "Members",
  //     name: "members",
  //     collection: "actors",
  //     search_fields: ["fullName", "username"],
  //     display_fields: ["fullName"],
  //     value_field: "uuid",
  //     multiple: true,
  //     required: false,
  //   }),
  //   DateField({ label: "Publish Date", name: "date" }),
  //   MarkdownField({ name: "body", label: "Body" }),
  // ],

}