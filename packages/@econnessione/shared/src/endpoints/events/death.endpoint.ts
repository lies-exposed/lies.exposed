import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Events } from "../../io/http";
import { Point, UUID } from "../../io/http/Common";
import { ListOutput, Output } from "../../io/http/Common/Output";
import { GetListQuery } from "../../io/http/Query";

const SingleDeathOutput = Output(Events.Death.Death, "Death");
const ListDeathsOutput = ListOutput(Events.Death.Death, "Deaths");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/deaths",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      victim: optionFromNullable(UUID),
    }),
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
      {
        victim: t.string,
        date: DateFromISOString,
      },
      "CreateDeathEventBody"
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
      location: optionFromNullable(Point),
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
