import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BaseProps } from "./Common/BaseProps.js";
import { Media } from "./Media/Media.js";

export const EditStoryBody = t.strict(
  {
    title: t.string,
    path: t.string,
    draft: t.boolean,
    creator: UUID,
    date: DateFromISOString,
    featuredImage: optionFromNullable(t.strict({ id: UUID })),
    body2: t.unknown,
    keywords: t.array(UUID),
    groups: t.array(UUID),
    actors: t.array(UUID),
    events: t.array(UUID),
    media: t.array(UUID),
  },
  "EditStoryBody",
);
export type EditStoryBody = t.TypeOf<typeof EditStoryBody>;

export const Story = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    path: t.string,
    draft: t.boolean,
    creator: t.union([UUID, t.undefined]),
    date: DateFromISOString,
    featuredImage: t.union([Media, t.undefined]),
    body: t.string,
    body2: t.union([t.unknown, t.null]),
    keywords: t.array(UUID),
    links: t.array(UUID),
    media: t.array(UUID),
    actors: t.array(UUID),
    groups: t.array(UUID),
    events: t.array(UUID),
  },
  "Story",
);

export type Story = t.TypeOf<typeof Story>;
