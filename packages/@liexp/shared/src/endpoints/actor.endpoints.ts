import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import { Actor } from "../io/http";
import { UUID } from "../io/http/Common";
import { ListOutput, Output } from "../io/http/Common/Output";
import { ResourceEndpoints } from "./types";

export const SingleActorOutput = Output(Actor.Actor, "Actor");
export type SingleActorOutput = t.TypeOf<typeof SingleActorOutput>;

export const ListActorOutput = ListOutput(Actor.Actor, "Actors");
export type ListActorOutput = t.TypeOf<typeof ListActorOutput>;

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/actors",
  Input: {
    Query: Actor.GetListActorQuery,
  },
  Output: ListActorOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleActorOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/actors",
  Input: {
    Query: undefined,
    Body: t.union([t.type({ search: t.string }), Actor.AddActorBody]),
  },
  Output: SingleActorOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: nonEmptyRecordFromType({
      username: optionFromNullable(t.string),
      fullName: optionFromNullable(t.string),
      color: optionFromNullable(t.string),
      excerpt: optionFromNullable(t.UnknownRecord),
      body: optionFromNullable(t.UnknownRecord),
      avatar: optionFromNullable(t.string),
      bornOn: optionFromNullable(DateFromISOString),
      diedOn: optionFromNullable(DateFromISOString),
      memberIn: optionFromNullable(
        t.array(
          t.union([
            UUID,
            t.strict({
              group: UUID,
              body: t.UnknownRecord,
              startDate: DateFromISOString,
              endDate: optionFromNullable(DateFromISOString),
            }),
          ])
        )
      ),
    }),
  },
  Output: SingleActorOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleActorOutput,
});

export const actors = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {},
});
