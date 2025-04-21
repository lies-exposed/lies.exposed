import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { UUID } from "../../io/http/Common/UUID.js";
import { Events } from "../../io/http/index.js";

const SinglePatentOutput = Output(Events.Patent.Patent).annotations({
  title: "SinglePatentOutput",
});
const ListPatentsOutput = ListOutput(Events.Patent.Patent, "Patents");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/patents",
  Input: {
    Query: Events.Patent.PatentListQuery,
  },
  Output: ListPatentsOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/patents/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SinglePatentOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/patents",
  Input: {
    Query: undefined,
    Body: Schema.Struct({
      ...Events.Patent.CreatePatentBody.omit("type").fields,
    }).annotations({
      title: "CreateDeathBody",
    }),
  },
  Output: SinglePatentOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/patents/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Events.Patent.EditPatentBody.omit("type").annotations({
      title: "EditPatentBody",
    }),
  },
  Output: SinglePatentOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/patents/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SinglePatentOutput,
});

export const patents = ResourceEndpoints({
  Create,
  Edit,
  List,
  Get,
  Delete,
  Custom: {},
});
