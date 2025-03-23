import { Schema } from "effect";
import { Endpoint, ResourceEndpoints } from "ts-endpoint";
import { OptionFromNullishToNull } from "../io/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/UUID.js";
import {
  GetNetworkParams,
  GetNetworkQuery,
  NetworkGraphOutput,
} from "../io/http/Network/Network.js";
import { GetListQuery } from "../io/http/Query/index.js";
import { StatsType } from "../io/http/Stats.js";

const SingleOutput = Output(NetworkGraphOutput).annotations({
  title: "Network",
});
const OutputList = ListOutput(Schema.Any, "NetworkList");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/networks",
  Input: {
    Query: Schema.Struct({
      ...GetListQuery.fields,
      type: StatsType,
      id: Schema.String,
    }),
  },
  Output: OutputList,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/networks",
  Input: {
    Query: undefined,
    Body: Schema.Unknown,
  },
  Output: SingleOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ type }) => `/networks/${type}`,
  Input: {
    Query: GetNetworkQuery,
    Params: GetNetworkParams,
  },
  Output: SingleOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ type, id }) => `/networks/${type}/${id}`,
  Input: {
    Params: Schema.Struct({ ...GetNetworkParams.fields, id: UUID }),
    Body: Schema.Struct({
      regenerate: OptionFromNullishToNull(Schema.Boolean),
    }),
  },
  Output: SingleOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/networks/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleOutput,
});

export const networks = ResourceEndpoints({
  Get,
  Edit,
  List,
  Create,
  Delete,
  Custom: {},
});
