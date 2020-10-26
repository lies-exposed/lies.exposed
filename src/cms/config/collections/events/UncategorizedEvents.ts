import { IOTSTypeToCMSFields } from "@cms/utils";
import { Uncategorized } from "@models/events/UncategorizedEvent";
import { CmsCollection } from "netlify-cms-core";

export const uncategorizedEvents: CmsCollection = {
  name: "UncategorizedEvents",
  label: "[Events] Uncategorized",
  folder: "content/events/uncategorized",
  media_folder: "../../static/media/events/uncategorized/{{fields.uuid}}",
  create: true,
  slug: "{{fields.uuid}}",
  summary: "[{{fields.uuid}}] {{slug}}",
  fields: IOTSTypeToCMSFields(Uncategorized)
}