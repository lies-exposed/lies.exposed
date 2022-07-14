import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromUndefined } from "../Common/optionFromUndefined";
import { URL, UUID } from "./Common";
import { CreateMedia } from "./Media";

export const CreateLink = t.strict(
  {
    url: URL,
    publishDate: t.union([DateFromISOString, t.undefined], "PublishDate"),
    events: t.array(UUID),
  },
  "CreateLink"
);
export type CreateLink = t.TypeOf<typeof CreateLink>;

export const EditLink = t.strict(
  {
    ...CreateLink.type.props,
    title: t.string,
    description: t.string,
    keywords: t.array(UUID),
    provider: t.union([UUID, t.undefined]),
    events: t.array(UUID),
    overrideThumbnail: optionFromUndefined(t.boolean),
  },
  "EditLinkBody"
);

export type EditLink = t.TypeOf<typeof EditLink>;

const { events, overrideThumbnail, ...linkBaseProps } = EditLink.type.props;

export const Link = t.strict(
  {
    ...linkBaseProps,
    id: UUID,
    title: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined]),
    publishDate: t.union([DateFromISOString, t.undefined]),
    image: t.union(
      [
        t.strict(
          {
            id: UUID,
            ...CreateMedia.type.props,
          },
          "LinkMedia"
        ),
        t.undefined,
      ],
      "LinkImage"
    ),
    keywords: t.array(UUID),
    provider: t.union([UUID, t.undefined]),
    events: t.array(UUID),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "Link"
);

export type Link = t.TypeOf<typeof Link>;
