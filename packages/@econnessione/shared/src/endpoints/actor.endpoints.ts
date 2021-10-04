import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import { Actor } from "../io/http";
import { UUID } from "../io/http/Common";
import { ListOutput, Output } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleActorOutput = Output(Actor.Actor, "Actor");
const ListActorOutput = ListOutput(Actor.Actor, "Actors");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/actors",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      ...Actor.GetListActorQueryFilter.props,
    }),
  },
  Output: ListActorOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleActorOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/actors",
  Input: {
    Query: undefined,
    Body: t.strict(
      {
        username: t.string,
        fullName: t.string,
        color: t.string,
        body: t.string,
        avatar: t.union([t.undefined, t.string]),
      },
      "AddActorBody"
    ),
  },
  Output: SingleActorOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: nonEmptyRecordFromType({
      username: optionFromNullable(t.string),
      fullName: optionFromNullable(t.string),
      color: optionFromNullable(t.string),
      body: optionFromNullable(t.string),
      avatar: optionFromNullable(t.string),
      memberIn: t.array(
        t.union([
          UUID,
          t.strict({
            group: UUID,
            body: t.string,
            startDate: DateFromISOString,
            endDate: optionFromNullable(DateFromISOString),
          }),
        ])
      ),
    }),
  },
  Output: SingleActorOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleActorOutput,
});

export const actors = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
});
