import { EventTypeKeys } from "@models/event"
import { CmsConfig, CmsCollection } from "netlify-cms-core"
import {
  CmsFieldV2,
  MarkdownField,
  ColorField,
  StringField,
  ImageField,
  RelationField,
  DateField,
} from "./field"

interface CmsCollectionV2 extends CmsCollection {
  path?: string
  media_folder?: string
  fields: CmsFieldV2[]
  delete?: boolean
}

interface CmsConfigV2 extends CmsConfig {
  local_backend?: boolean | { url: string }
}

const articles: CmsCollectionV2 = {
  name: "articles",
  label: "Articoli",
  label_singular: "Articolo",
  folder: "content/articles",
  media_folder: "../../static/media/articles/{{slug}}",
  create: true,
  slug: "{{fields.path}}",
  editor: {
    preview: true,
  },
  fields: [
    { label: "Draft", name: "draft", widget: "boolean" },
    { label: "Title", name: "title", widget: "string" },
    { label: "Path", name: "path", widget: "string" },
    { label: "Publish Date", name: "date", widget: "datetime" },
    { label: "Body", name: "body", widget: "markdown" },
  ],
}

const actors: CmsCollectionV2 = {
  name: "actors",
  label: "Actor",
  slug: "{{fields.uuid}}",
  folder: "content/actors",
  media_folder: "../../static/media/actors/{{fields.uuid}}",
  create: true,
  editor: {
    preview: true,
  },
  fields: [
    { label: "UUID", name: "uuid", widget: "uuid" },
    StringField({ label: "Full Name", name: "fullName" }),
    StringField({ label: "Username", name: "username" }),
    ImageField({ label: "Avatar", name: "avatar", required: false }),
    { label: "Publish Date", name: "date", widget: "datetime" },
    ColorField({}),
    MarkdownField({}),
  ],
}

const groups: CmsCollectionV2 = {
  name: "groups",
  label: "Groups",
  label_singular: "Group",
  folder: "content/groups",
  media_folder: "../../static/media/groups/{{fields.uuid}}",
  summary: "[{{fields.uuid}}] {{fields.name}}",
  slug: "{{fields.uuid}}",
  create: true,
  fields: [
    { label: "UUID", name: "uuid", widget: "uuid" },
    StringField({ label: "Name", name: "name" }),
    ImageField({ label: "Avatar", name: "avatar", required: false }),
    ColorField({}),
    RelationField({
      label: "Members",
      name: "members",
      collection: "actors",
      searchFields: ["fullName", "username"],
      displayFields: ["fullName"],
      valueField: "uuid",
      multiple: true,
      required: false,
    }),
    DateField({ label: "Publish Date" }),
    MarkdownField({}),
  ],
}

const events: CmsCollectionV2 = {
  name: "events",
  label: "Event",
  folder: "content/events",
  media_folder: "../../static/media/events/{{fields.uuid}}",
  create: true,
  editor: {
    preview: true,
  },
  slug: "{{fields.uuid}}",
  summary: "[{{fields.uuid}}] {{slug}}",
  fields: [
    { label: "UUID", name: "uuid", widget: "uuid" },
    { label: "Title", name: "title", widget: "string" },
    {
      label: "Date",
      name: "date",
      widget: "datetime",
      format: "YYYY-MM-DD",
    },
    {
      label: "Location",
      name: "location",
      widget: "map",
      required: false,
    },
    {
      label: "Type",
      name: "type",
      widget: "select",
      options: Object.keys(EventTypeKeys),
      required: false,
    },
    {
      label: "Actors",
      name: "actors",
      widget: "relation",
      collection: "actors",
      searchFields: ["username", "fullName"],
      displayFields: ["fullName"],
      valueField: "uuid",
      multiple: true,
      required: false,
    },
    {
      label: "Groups",
      name: "groups",
      widget: "relation",
      collection: "groups",
      searchFields: ["name"],
      displayFields: ["name"],
      valueField: "uuid",
      multiple: true,
      required: false,
    },
    {
      label: "Topic",
      name: "topics",
      widget: "relation",
      collection: "topics",
      searchFields: ["label"],
      displayFields: ["label"],
      valueField: "uuid",
      multiple: true,
    },
    {
      label: "Links",
      name: "links",
      widget: "list",
      required: false,
      collapsed: false,
      summary: "{{fields.link}}",
      field: { label: "Link", name: "link", widget: "string" },
    },
    {
      label: "Images",
      name: "images",
      required: false,
      collapsed: true,
      widget: "list",
      fields: [
        ImageField({ label: "Image", name: "image" }),
        StringField({ label: "Description", name: "description" }),
      ],
    },
    MarkdownField({}),
  ],
}

const pages: CmsCollectionV2 = {
  name: "pages",
  label: "Page",
  folder: "content/pages",
  media_folder: "../../static/media/pages/{{slug}}",
  create: true,
  editor: {
    preview: true,
  },
  fields: [StringField({ label: "Title", name: "title" }), MarkdownField({})],
}

const topics: CmsCollectionV2 = {
  name: "topics",
  label: "Topic",
  folder: "content/topics",
  identifier_field: "uuid",
  media_folder: "../../static/media/topics/{{fields.uuid}}",
  create: true,
  editor: {
    preview: true,
  },
  delete: false,
  summary: "[{{fields.uuid}}] {{fields.label}}",
  fields: [
    { label: "UUID", name: "uuid", widget: "uuid" },
    StringField({ label: "Label", name: "label" }),
    StringField({ label: "Slug", name: "slug" }),
    ColorField({}),
    { label: "Publish Date", name: "date", widget: "datetime" },
    MarkdownField({}),
  ],
}

export const config: CmsConfigV2 = {
  backend: {
    name: "git-gateway",
    repo: "ascariandrea/econnessione",
    open_authoring: true,
  },
  local_backend:
    process.env.NODE_ENV !== "development"
      ? false
      : {
          url: "http://localhost:8082/api/v1",
        },
  publish_mode:
    process.env.NODE_ENV === "development" ? "simple" : "editorial_workflow",
  media_folder: "static/media",
  public_folder: "media",
  collections: [events, articles, actors, groups, pages, topics],
}
