import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Media } from "../io/http";
import { ListOutput, Output } from "../io/http/Common/Output";
import { MediaType } from "../io/http/Media";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleMediaOutput = Output(Media.Media, "Media");
const ListMediaOutput = ListOutput(Media.Media, "MediaList");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/media",
  Input: {
    Query: t.type(
      {
        ...GetListQuery.props,
        type: optionFromNullable(t.union([t.array(MediaType), t.string])),
        events: optionFromNullable(t.array(UUID)),
        ids: optionFromNullable(t.array(UUID)),
        exclude: optionFromNullable(t.array(UUID)),
        description: optionFromNullable(t.string),
        emptyEvents: optionFromNullable(BooleanFromString),
        deletedOnly: optionFromNullable(BooleanFromString),
        creator: optionFromNullable(UUID),
        keywords: optionFromNullable(t.array(UUID)),
        actors: optionFromNullable(t.array(UUID)),
        groups: optionFromNullable(t.array(UUID))
      },
      "MediaListQuery"
    ),
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

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/media",
  Input: {
    Query: undefined,
    Body: t.strict(
      {
        type: MediaType,
        location: t.string,
        description: t.string,
        keywords: t.array(UUID),
        events: t.array(UUID),
      },
      "CreateImageBody"
    ),
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
      links: t.array(UUID),
      events: t.array(UUID),
      keywords: t.array(UUID),
      creator: optionFromNullable(UUID),
      overrideThumbnail: optionFromNullable(t.boolean),
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
  Custom: {},
});
