import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord.js";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { URL } from "../io/http/Common/index.js";
import { Link } from "../io/http/Link.js";
import * as Media from "../io/http/Media/index.js";
import { ExtractEntitiesWithNLPOutput } from "../io/http/admin/ExtractNLPEntities.js";

const SingleMediaOutput = Output(Media.Media).annotations({
  title: "SingleMediaMedia",
});
const ListMediaOutput = ListOutput(Media.Media, "MediaList");

const GetMetadataQuery = Schema.Struct({
  url: URL,
  type: Schema.Union(Schema.Literal("ScientificStudy"), Schema.Literal("Link")),
}).annotations({
  title: "GetMetadataQuery",
});

export const GetMetadata = Endpoint({
  Method: "GET",
  getPath: () => "/open-graph/metadata",
  Input: {
    Query: GetMetadataQuery,
  },
  Output: Output(
    Schema.Struct({
      metadata: Schema.Any,
      link: Schema.Union(Link, Schema.Undefined),
      relations: ExtractEntitiesWithNLPOutput,
    }),
  ).annotations({ title: "GetMetadataOutput" }),
});

export const List = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/open-graph/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: ListMediaOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/open-graph/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: Schema.Unknown,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/open-graph",
  Input: {
    Query: undefined,
    Body: Schema.Struct({
      type: Media.MediaType,
      location: Schema.String,
      description: Schema.String,
    }).annotations({
      title: "CreateImageBody",
    }),
  },
  Output: SingleMediaOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/open-graph/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
    Body: nonEmptyRecordFromType({
      type: Media.MediaType,
      location: Schema.String,
      description: Schema.String,
    }),
  },
  Output: SingleMediaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/open-graph/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
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
