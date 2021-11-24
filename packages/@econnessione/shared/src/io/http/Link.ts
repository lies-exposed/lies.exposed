import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { URL } from "./Common/URL";

export const CreateLink = t.strict(
  {
    url: URL,
    publishDate: t.union([DateFromISOString, t.undefined]),
    events: t.array(t.string),
  },
  "CreateLink"
);
export type CreateLink = t.TypeOf<typeof CreateLink>;

export const EditLink = t.strict(
  {
    ...CreateLink.type.props,
    title: t.string,
    description: t.string,
    keywords: t.array(t.string),
    provider: t.string,
    events: t.array(t.string),
  },
  "EditLinkBody"
);

export type EditLink = t.TypeOf<typeof EditLink>;

const { events, ...linkBaseProps } = EditLink.type.props;

export const Link = t.strict(
  {
    ...linkBaseProps,
    id: UUID,
    title: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined]),
    image: t.union([t.string, t.undefined]),
    keywords: t.array(t.string),
    provider: t.union([t.string, t.undefined]),
    events: t.array(t.string),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "Link"
);

export type Link = t.TypeOf<typeof Link>;
