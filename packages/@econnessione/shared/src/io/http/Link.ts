import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { URL } from "./Common/URL";

export const CreateLink = t.strict(
  {
    url: URL,
    events: optionFromNullable(t.array(t.string)),
  },
  "CreateLink"
);
export type CreateLink = t.TypeOf<typeof CreateLink>;

const { events, ...createLinkProps } = CreateLink.type.props;
export const Link = t.strict(
  {
    ...createLinkProps,
    id: UUID,
    title: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined]),
    keywords: t.array(t.string),
    provider: t.union([t.string, t.undefined]),
    events: t.array(t.string),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "Link"
);

export type Link = t.TypeOf<typeof Link>;
