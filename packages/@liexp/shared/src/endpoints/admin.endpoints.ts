import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { Endpoint } from "ts-endpoint";
import { ShareMessageBody } from "../io/http/ShareMessage";
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

export const PostToPlatform = Endpoint({
  Method: "POST",
  getPath: ({ id }) => `/admins/share/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: ShareMessageBody,
  },
  Output: t.any,
});

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

const admin = ResourceEndpoints({
  Get,
  Create,
  List,
  Edit,
  Delete,
  Custom: {
    PostToPlatform,
  },
});

export { admin };
