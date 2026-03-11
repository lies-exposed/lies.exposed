import { Schema } from "effect";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";

export const Page = Schema.Struct({
  ...BaseProps.fields,
  title: Schema.String,
  path: Schema.String,
  excerpt: Schema.Union(BlockNoteDocument, Schema.Any, Schema.Null),
  body: Schema.Union(BlockNoteDocument, Schema.Any, Schema.Null),
}).annotations({
  title: "Page",
});
export type Page = typeof Page.Type;

export const CreatePage = Page.omit("id", "createdAt", "updatedAt").annotations(
  {
    title: "CreatePage",
  },
);
export type CreatePage = typeof CreatePage.Type;

export const EditPage = Page.omit(
  "id",
  "createdAt",
  "updatedAt",
).annotations({
  title: "EditPage",
});

export type EditPage = typeof EditPage.Type;
