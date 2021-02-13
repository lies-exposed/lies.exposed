import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import { Area } from "../io/http";
import { Polygon } from "../io/http/Common";
import { GetListOutput, Output } from "../io/http/Common/Output";

const SingleAreaOutput = Output(Area.Area, "Area");
const ListAreaOutput = GetListOutput(Area.Area, "Areas");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/areas",
  Input: {
    Query: undefined,
  },
  Output: ListAreaOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: { id: t.string },
  },
  Output: SingleAreaOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/areas",
  Input: {
    Query: undefined,
    Body: t.strict(
      {
        label: t.string,
        polygon: Polygon,
      },
      "AddActorBody"
    ),
  },
  Output: SingleAreaOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/areas/${id}`,
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
  Output: SingleAreaOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/areas/${id}`,
  Input: {
    Params: { id: t.string },
  },
  Output: SingleAreaOutput,
});
