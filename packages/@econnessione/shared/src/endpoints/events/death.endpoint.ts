import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Events } from "../../io/http";
import { Point } from "../../io/http/Common";
import { ListOutput, Output } from "../../io/http/Common/Output";
import { propsOmit } from "../../tests/arbitrary/utils.arbitrary";
import { ResourceEndpoints } from "../types";

const SingleDeathOutput = Output(Events.Death.Death, "Death");
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
    Params: t.type({ id: t.string }),
  },
  Output: SingleDeathOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/deaths",
  Input: {
    Query: undefined,
    Body: t.strict(
      propsOmit(Events.Death.CreateDeathBody, ["type"]),
      "CreateDeathBody"
    ),
  },
  Output: SingleDeathOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/deaths/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: t.strict({
      excerpt: optionFromNullable(t.UnknownRecord),
      body: optionFromNullable(t.UnknownRecord),
      payload: t.strict({
        victim: optionFromNullable(UUID),
        location: optionFromNullable(Point),
      }),
    }),
  },
  Output: SingleDeathOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/deaths/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
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
