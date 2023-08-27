import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { Endpoint } from "ts-endpoint";
import { Color, URL } from "../io/http/Common";
import { ResourceEndpoints } from "./types";

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
      text: t.string,
      media: URL,
      textBlend: t.string,
      textGravity: t.string,
      textWidth: t.union([t.number, t.undefined]),
      background: t.union([Color, t.undefined]),
    }),
  },
  Output: t.any,
});

const admin = ResourceEndpoints({
  Get,
  Create,
  List,
  Edit,
  Delete,
  Custom: {
    BuildImage,
  },
});

export { admin };
