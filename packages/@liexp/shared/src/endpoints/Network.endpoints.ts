import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import {
  GetNetworkParams,
  GetNetworkQuery,
  NetworkGraphOutput,
} from "../io/http/Network/Network.js";
import { GetListQuery } from "../io/http/Query/index.js";
import { StatsType } from "../io/http/Stats.js";
import { ResourceEndpoints } from "./types.js";

const SingleOutput = Output(NetworkGraphOutput, "Networks");
const OutputList = ListOutput(t.any, "NetworkList");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/networks",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      type: StatsType,
      id: t.string,
    }),
  },
  Output: OutputList,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/networks",
  Input: {
    Query: undefined,
    Body: t.unknown,
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
    Params: t.type({ ...GetNetworkParams.props, id: UUID }),
    Body: t.strict({ regenerate: optionFromNullable(t.boolean) }),
  },
  Output: SingleOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/networks/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: UUID }),
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
