import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { UUID } from "../../io/http/Common/UUID.js";

export const ListHealthcheck = Endpoint({
  Method: "GET",
  getPath: () => "/healthcheck",
  Input: undefined,
  Output: Schema.Unknown,
});

export const GetHealthcheck = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/healthcheck/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Schema.Unknown,
});

export const CreateHealthcheck = Endpoint({
  Method: "POST",
  getPath: () => `/healthcheck`,
  Input: {
    Body: Schema.Unknown,
  },
  Output: Schema.Unknown,
});

export const EditPage = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/healthcheck/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Schema.Unknown,
  },
  Output: Schema.Unknown,
});

export const DeleteHealthcheck = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/healthcheck/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Schema.Unknown,
});

export const healthcheck = ResourceEndpoints({
  Create: CreateHealthcheck,
  Get: GetHealthcheck,
  List: ListHealthcheck,
  Edit: EditPage,
  Delete: DeleteHealthcheck,
  Custom: {},
});
