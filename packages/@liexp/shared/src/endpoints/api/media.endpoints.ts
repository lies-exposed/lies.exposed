import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as Media from "@liexp/io/lib/http/Media/index.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const SingleMediaOutput = Output(Media.Media).annotations({
  title: "Media",
});
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
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleMediaOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/media",
  Input: {
    Query: undefined,
    Body: Media.CreateMedia,
  },
  Output: SingleMediaOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/media/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Media.EditMediaBody,
  },
  Output: SingleMediaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/media/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
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
        Params: Schema.Struct({ id: UUID }),
      },
      Output: Schema.Struct({ data: Schema.Boolean }),
    }),
  },
});
