import { Schema } from "effect";
import { Endpoint } from "ts-endpoint";
import { Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/UUID.js";
import {
  MediaImageLayer,
  TextLayer,
  WatermarkLayer,
} from "../io/http/admin/BuildImage.js";
import {
  ExtractEntitiesWithNLPInput,
  ExtractEntitiesWithNLPOutput,
} from "../io/http/admin/ExtractNLPEntities.js";
import {
  AdminMediaStats,
  AdminMediaStatsTotals,
} from "../io/http/admin/stats/AdminMediaStats.js";
import { ResourceEndpoints } from "./types.js";

export const List = Endpoint({
  Method: "GET",
  getPath: () => `/admins`,
  Output: Schema.Unknown,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/admins",
  Input: {
    Body: Schema.Unknown,
  },
  Output: Schema.Unknown,
});

// export const PostToPlatform = Endpoint({
//   Method: "POST",
//   getPath: ({ type, id }) => `/admins/share/${type}/${id}`,
//   Input: {
//     Params: Schema.Struct({ id: UUID, type: SocialPostResourceType }),
//     Body: SocialPost,
//   },
//   Output: Schema.Any,
// });

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/admins/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Schema.Unknown,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/admins/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Schema.Unknown,
  },
  Output: Schema.Unknown,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/admins/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Schema.Unknown,
});

export const BuildImage = Endpoint({
  Method: "POST",
  getPath: () => `/admins/images/build`,
  Input: {
    Body: Schema.Struct({
      layers: Schema.Struct({
        media: Schema.Union(MediaImageLayer, Schema.Undefined),
        text: Schema.Union(TextLayer, Schema.Undefined),
        watermark: Schema.Union(WatermarkLayer, Schema.Undefined),
      }).annotations({
        title: "Layers",
      }),
    }),
  },
  Output: Output(Schema.Struct({ success: Schema.Boolean })).annotations({
    title: "BuildImageOutput",
  }),
});

export const SearchAreaCoordinates = Endpoint({
  Method: "POST",
  getPath: ({ id }) => `/admins/areas/${id}/search-coordinates`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Schema.Struct({
      label: Schema.String,
    }),
  },
  Output: Schema.Any,
});

export const GetMediaStats = Endpoint({
  Method: "GET",
  getPath: () => `/admins/media/stats`,
  Output: Schema.Struct({
    data: AdminMediaStats,
    totals: AdminMediaStatsTotals,
    total: Schema.Number,
  }),
});

export const GetLinkStats = Endpoint({
  Method: "GET",
  getPath: () => `/admins/link/stats`,
  Output: Schema.Struct({
    data: Schema.Struct({
      // noPublishDate: Schema.Number,
      // noThumbnails: Schema.Number,
    }),
    totals: Schema.Struct({
      noPublishDate: Schema.Number,
      noThumbnails: Schema.Number,
    }),
    total: Schema.Number,
  }),
});

const ExtractEntitiesWithNLP = Endpoint({
  Method: "POST",
  getPath: () => `/admins/nlp/extract-entities`,
  Input: {
    Body: ExtractEntitiesWithNLPInput,
  },
  Output: Output(ExtractEntitiesWithNLPOutput).annotations({
    title: "ExtractEntitiesWithNLPOutput",
  }),
});

const admin = ResourceEndpoints({
  Get,
  Create,
  List,
  Edit,
  Delete,
  Custom: {
    BuildImage,
    SearchAreaCoordinates,
    GetLinkStats,
    GetMediaStats,
    ExtractEntitiesWithNLP,
  },
});

export { admin };
