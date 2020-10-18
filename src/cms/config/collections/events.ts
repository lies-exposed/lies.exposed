import { IOTSTypeToCMSFields } from "@cms/utils";
import { EventFrontmatter } from "@models/event";
import { CmsCollection } from "netlify-cms-core"

export const events: CmsCollection = {
  name: "events",
  label: "Event",
  folder: "content/events",
  media_folder: "../../static/media/events/{{fields.uuid}}",
  create: true,
  slug: "{{fields.uuid}}",
  summary: "[{{fields.uuid}}] {{slug}}",
  fields: IOTSTypeToCMSFields(EventFrontmatter)
  // fields: [
  //   UUIDField,
  //   StringField({ label: "Title", name: "title" }),
  //   DateField({ name: "date", label: "Date" }),
  //   MapField({ name: "location", label: "location", required: false }),
  //   {
  //     label: "Type",
  //     name: "type",
  //     widget: "select",
  //     value_field: "type",
  //     options: Object.keys(EventTypeKeys),
  //     required: false,
  //   },
  //   RelationField({
  //     name: "actors",
  //     label: "Actors",
  //     collection: "actors",
  //     search_fields: ["username", "fullName"],
  //     display_fields: ["fullName"],
  //     value_field: "uuid",
  //     multiple: true,
  //     required: false,
  //   }),
  //   RelationField({
  //     label: "Groups",
  //     name: "groups",
  //     collection: "groups",
  //     search_fields: ["name"],
  //     display_fields: ["name"],
  //     multiple: true,
  //     required: false,
  //   }),
  //   RelationField({
  //     label: "Topic",
  //     name: "topics",
  //     widget: "relation",
  //     collection: "topics",
  //     search_fields: ["label"],
  //     display_fields: ["label"],
  //     value_field: "uuid",
  //     multiple: true,
  //   }),
  //   {
  //     label: "Links",
  //     name: "links",
  //     widget: "list",
  //     required: false,
  //     collapsed: false,
  //     summary: "{{fields.link}}",
  //     field: { label: "Link", name: "link", widget: "string" },
  //   },
  //   {
  //     label: "Images",
  //     name: "images",
  //     required: false,
  //     collapsed: true,
  //     widget: "list",
  //     fields: [
  //       ImageField({ label: "Image", name: "image" }),
  //       StringField({ label: "Description", name: "description" }),
  //     ],
  //   },
  //   MarkdownField({ name: "body", label: "body" }),
  // ],
}