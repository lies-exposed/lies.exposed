import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Media } from "../io/http";
import { ListOutput, Output } from "../io/http/Common/Output";
import { MediaType } from "../io/http/Media";
import { ResourceEndpoints } from "./types";

const SingleMediaOutput = Output(Media.Media, "Media");
const ListMediaOutput = ListOutput(Media.Media, "MediaList");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/media",
  Input: {
    Query: Media.GetListMediaQuery,
  },
  Output: ListMediaOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/media/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.unknown,
});

const CreateMediaBody = t.strict(
  {
    type: MediaType,
    location: t.string,
    description: t.string,
    extra: t.union([t.any, t.undefined]),
    areas: t.array(UUID),
    keywords: t.array(UUID),
    events: t.array(UUID),
  },
  "CreateImageBody",
);

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/media",
  Input: {
    Query: undefined,
    Body: CreateMediaBody,
  },
  Output: SingleMediaOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/media/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict({
      type: Media.MediaType,
      thumbnail: optionFromNullable(t.string),
      location: t.string,
      description: t.string,
      extra: optionFromNullable(t.strict({ duration: t.number })),
      links: t.array(UUID),
      events: t.array(UUID),
      keywords: t.array(UUID),
      areas: t.array(UUID),
      creator: optionFromNullable(UUID),
      overrideThumbnail: optionFromNullable(t.boolean),
      transfer: optionFromNullable(t.boolean),
      transferThumbnail: optionFromNullable(t.boolean),
    }),
  },
  Output: SingleMediaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/media/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleMediaOutput,
});

export const media = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {
    GetThumbnails: Endpoint({
      Method: "POST",
      getPath: ({ id }) => `/media/${id}/thumbnails`,
      Input: {
        Params: t.type({ id: UUID }),
      },
      Output: t.strict({ data: t.array(t.any) }),
    }),
  },
});
