import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord.js";
import { BlockNoteDocument } from "../io/http/Common/BlockNoteDocument.js";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/index.js";
import { Actor } from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";

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
    Body: Actor.CreateActorBody,
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
      excerpt: optionFromNullable(t.array(t.any)),
      body: optionFromNullable(t.array(t.any)),
      avatar: optionFromNullable(t.string),
      bornOn: optionFromNullable(DateFromISOString),
      diedOn: optionFromNullable(DateFromISOString),
      memberIn: optionFromNullable(
        t.array(
          t.union([
            UUID,
            t.strict({
              group: UUID,
              body: BlockNoteDocument,
              startDate: DateFromISOString,
              endDate: optionFromNullable(DateFromISOString),
            }),
          ]),
        ),
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
