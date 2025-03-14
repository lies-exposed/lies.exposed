import { Schema } from "effect";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { UUID } from "../../io/http/Common/UUID.js";
import { Events } from "../../io/http/index.js";
import { ResourceEndpoints } from "../types.js";

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
