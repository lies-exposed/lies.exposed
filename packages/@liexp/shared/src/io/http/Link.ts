import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromUndefined } from "../Common/optionFromUndefined";
import { URL, UUID } from "./Common";
import { CreateMedia } from "./Media";

export const CreateLink = t.strict(
  {
    url: URL,
    publishDate: t.union([DateFromISOString, t.undefined], "PublishDate"),
    description: t.union([t.string, t.undefined]),
    events: t.array(UUID),
  },
  "CreateLink"
);
export type CreateLink = t.TypeOf<typeof CreateLink>;

const LinkMedia = t.strict(
  {
    id: UUID,
    ...CreateMedia.type.props,
  },
  "LinkMedia"
);
type LinkMedia = t.TypeOf<typeof LinkMedia>;

export const EditLink = t.strict(
  {
    ...CreateLink.type.props,
    title: t.string,
    description: t.string,
    keywords: t.array(UUID),
    provider: t.union([UUID, t.undefined]),
    events: t.array(UUID),
    creator: optionFromUndefined(UUID),
    image: t.union([LinkMedia, UUID, t.undefined], "LinkImage"),
    overrideThumbnail: optionFromUndefined(t.boolean),
  },
  "EditLinkBody"
);

export type EditLink = t.TypeOf<typeof EditLink>;

const { events, overrideThumbnail, image, ...linkBaseProps } =
  EditLink.type.props;

export const Link = t.strict(
  {
    ...linkBaseProps,
    id: UUID,
    title: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined]),
    publishDate: t.union([DateFromISOString, t.undefined]),
    image: t.union([LinkMedia, t.undefined]),
    keywords: t.array(UUID),
    provider: t.union([UUID, t.undefined]),
    creator: t.union([UUID, t.undefined]),
    events: t.array(UUID),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    deletedAt: t.union([DateFromISOString, t.undefined]),
  },
  "Link"
);

export type Link = t.TypeOf<typeof Link>;
