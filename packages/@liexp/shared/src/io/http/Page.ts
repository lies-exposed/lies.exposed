import * as t from "io-ts";
import { propsOmit } from "../utils";
import { BaseProps } from "./Common/BaseProps";

export const Page = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    path: t.string,
    body: t.string,
    excerpt: t.union([t.UnknownRecord, t.null]),
    body2: t.union([t.UnknownRecord, t.null]),
  },
  "Page"
);
export type Page = t.TypeOf<typeof Page>;

export const EditPage = t.strict(
  propsOmit(Page, ["id", "createdAt", "updatedAt"]),
  "EditPage"
);

export type EditPage = t.TypeOf<typeof EditPage>;
