import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Actor } from "../io/http";
import { nonEmptyRecordFromType } from "./NonEmptyRecord";
import { Output } from "./Output";

const SingleActorOutput = Output(Actor.Actor, "Actor");
const ListActorOutput = Output(t.array(Actor.Actor), "Actors");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/actors",
  Input: {
    Query: undefined,
  },
  Output: ListActorOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: { id: t.string },
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
        avatar: t.strict({
          src: t.string,
          path: t.string,
        }),
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
    Params: { id: t.string },
    Body: nonEmptyRecordFromType({
      username: optionFromNullable(t.string),
      fullName: optionFromNullable(t.string),
      color: optionFromNullable(t.string),
      body: optionFromNullable(t.string),
      avatar: optionFromNullable(
        t.strict({
          src: t.string,
          path: t.string,
        })
      ),
    }),
  },
  Output: SingleActorOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/actors/${id}`,
  Input: {
    Params: { id: t.string },
  },
  Output: SingleActorOutput,
});
