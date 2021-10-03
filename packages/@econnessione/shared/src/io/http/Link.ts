import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { URL } from "../Common";

export const CreateLink = t.strict(
  {
    url: URL,
    description: t.string,
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
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "Link"
);

export type Link = t.TypeOf<typeof Link>;
