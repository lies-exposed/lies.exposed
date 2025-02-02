import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { CreateMedia, EditMediaBody } from "../io/http/Media/index.js";
import { Media } from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";

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
  Output: SingleMediaOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/media",
  Input: {
    Query: undefined,
    Body: CreateMedia,
  },
  Output: SingleMediaOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/media/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: EditMediaBody,
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
    GenerateThumbnails: Endpoint({
      Method: "POST",
      getPath: ({ id }) => `/media/${id}/thumbnails`,
      Input: {
        Params: t.type({ id: UUID }),
      },
      Output: t.strict({ data: t.boolean }),
    }),
  },
});
