import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as Events from "@liexp/io/lib/http/Events/index.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const SingleDeathOutput = Output(Events.Death.Death).annotations({
  title: "Death",
});
const ListDeathsOutput = ListOutput(Events.Death.Death, "Deaths");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/deaths",
  Input: {
    Query: Events.Death.DeathListQuery,
  },
  Output: ListDeathsOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/deaths/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleDeathOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/deaths",
  Input: {
    Query: undefined,
    Body: Events.Death.CreateDeathBody.omit("type").annotations({
      title: "CreateDeathBody",
    }),
  },
  Output: SingleDeathOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/deaths/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Events.Death.CreateDeathBody.omit("type").annotations({
      title: "CreateDeathBody",
    }),
  },
  Output: SingleDeathOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/deaths/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleDeathOutput,
});

export const deaths = ResourceEndpoints({
  Create,
  Edit,
  List,
  Get,
  Delete,
  Custom: {},
});
