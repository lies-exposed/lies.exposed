import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { nonEmptyRecordFromType } from "../../io/Common/NonEmptyRecord.js";
import { OptionFromNullishToNull } from "../../io/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { UUID } from "../../io/http/Common/index.js";
import {
  CreateNationBody,
  GetListNationQuery,
  Nation,
} from "../../io/http/Nation.js";

export const SingleNationOutput = Output(Nation).annotations({
  identifier: "SingleNationOutput",
});
export type SingleNationOutput = typeof SingleNationOutput.Type;

export const ListNationrOutput = ListOutput(Nation, "Actors");
export type ListNationrOutput = typeof ListNationrOutput.Type;

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/nations",
  Input: {
    Query: GetListNationQuery,
  },
  Output: ListNationrOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/nations/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleNationOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/nations",
  Input: {
    Query: undefined,
    Body: CreateNationBody,
  },
  Output: SingleNationOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/nations/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: nonEmptyRecordFromType({
      name: OptionFromNullishToNull(Schema.String),
    }).annotations({
      title: "EditNationBody",
    }),
  },
  Output: SingleNationOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/nations/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleNationOutput,
});

export const nations = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {},
});
