import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { Endpoint } from "ts-endpoint";
import { ResourceEndpoints } from "./types.js";

export const ListHealthcheck = Endpoint({
  Method: "GET",
  getPath: () => "/healthcheck",
  Input: undefined,
  Output: t.unknown,
});

export const GetHealthcheck = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/healthcheck/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.unknown,
});

export const CreateHealthcheck = Endpoint({
  Method: "POST",
  getPath: () => `/healthcheck`,
  Input: {
    Body: t.unknown,
  },
  Output: t.unknown,
});

export const EditPage = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/healthcheck/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.unknown,
  },
  Output: t.unknown,
});

export const DeleteHealthcheck = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/healthcheck/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.unknown,
});

export const healthcheck = ResourceEndpoints({
  Create: CreateHealthcheck,
  Get: GetHealthcheck,
  List: ListHealthcheck,
  Edit: EditPage,
  Delete: DeleteHealthcheck,
  Custom: {},
});
