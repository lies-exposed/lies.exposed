import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { BaseProps } from "./Common/BaseProps.js";
import { BlockNoteDocument } from "./Common/BlockNoteDocument.js";

export const Page = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    path: t.string,
    body: t.union([t.string, t.undefined]),
    excerpt: t.union([BlockNoteDocument, t.any, t.null]),
    body2: t.union([BlockNoteDocument, t.any, t.null]),
  },
  "Page",
);
export type Page = t.TypeOf<typeof Page>;

export const CreatePage = t.strict(
  propsOmit(Page, ["id", "createdAt", "updatedAt"]),
  "CreatePage",
);
export type CreatePage = t.TypeOf<typeof CreatePage>;

export const EditPage = t.strict(
  propsOmit(Page, ["id", "body", "createdAt", "updatedAt"]),
  "EditPage",
);

export type EditPage = t.TypeOf<typeof EditPage>;
