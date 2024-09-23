import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { Endpoint } from "ts-endpoint";
import { Output } from "../io/http/Common/Output.js";
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
  Output: t.unknown,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/admins",
  Input: {
    Body: t.unknown,
  },
  Output: t.unknown,
});

// export const PostToPlatform = Endpoint({
//   Method: "POST",
//   getPath: ({ type, id }) => `/admins/share/${type}/${id}`,
//   Input: {
//     Params: t.type({ id: UUID, type: SocialPostResourceType }),
//     Body: SocialPost,
//   },
//   Output: t.any,
// });

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/admins/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.unknown,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/admins/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.unknown,
  },
  Output: t.unknown,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/admins/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.unknown,
});

export const BuildImage = Endpoint({
  Method: "POST",
  getPath: () => `/admins/images/build`,
  Input: {
    Body: t.strict({
      layers: t.strict(
        {
          media: t.union([MediaImageLayer, t.undefined]),
          text: t.union([TextLayer, t.undefined]),
          watermark: t.union([WatermarkLayer, t.undefined]),
        },
        "Layers",
      ),
    }),
  },
  Output: t.any,
});

export const SearchAreaCoordinates = Endpoint({
  Method: "POST",
  getPath: ({ id }) => `/admins/areas/${id}/search-coordinates`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict({
      label: t.string,
    }),
  },
  Output: t.any,
});

export const GetMediaStats = Endpoint({
  Method: "GET",
  getPath: () => `/admins/media/stats`,
  Output: t.strict({
    data: AdminMediaStats,
    totals: AdminMediaStatsTotals,
    total: t.number,
  }),
});

export const GetLinkStats = Endpoint({
  Method: "GET",
  getPath: () => `/admins/link/stats`,
  Output: t.strict({
    data: t.strict({
      // noPublishDate: t.number,
      // noThumbnails: t.number,
    }),
    totals: t.strict({
      noPublishDate: t.number,
      noThumbnails: t.number,
    }),
    total: t.number,
  }),
});

const ExtractEntitiesWithNLP = Endpoint({
  Method: "POST",
  getPath: () => `/admins/nlp/extract-entities`,
  Input: {
    Body: ExtractEntitiesWithNLPInput,
  },
  Output: Output(ExtractEntitiesWithNLPOutput, "ExtractEntitiesWithNLPOutput"),
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
