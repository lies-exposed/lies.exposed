import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import { Media } from "../io/http";
import { URL } from "../io/http/Common";
import { ListOutput, Output } from "../io/http/Common/Output";
import { MediaType } from "../io/http/Media";
import { ResourceEndpoints } from "./types";

const SingleMediaOutput = Output(Media.Media, "Media");
const ListMediaOutput = ListOutput(Media.Media, "MediaList");

export const GetMetadata = Endpoint({
  Method: "GET",
  getPath: () => "/open-graph/metadata",
  Input: {
    Query: t.type({
      url: URL,
      type: t.union([t.literal("ScientificStudy"), t.literal("Link")]),
    }),
  },
  Output: ListMediaOutput,
});

export const List = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/open-graph/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: t.unknown,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/open-graph/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: t.unknown,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/open-graph",
  Input: {
    Query: undefined,
    Body: t.strict(
      {
        type: MediaType,
        location: t.string,
        description: t.string,
        // events: t.array(t.string),
      },
      "CreateImageBody"
    ),
  },
  Output: SingleMediaOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/open-graph/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: nonEmptyRecordFromType({
      type: Media.MediaType,
      location: t.string,
      description: t.string,
      // events: t.array(t.string),
    }),
  },
  Output: SingleMediaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/open-graph/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleMediaOutput,
});

export const openGraphs = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {
    GetMetadata,
  },
});
