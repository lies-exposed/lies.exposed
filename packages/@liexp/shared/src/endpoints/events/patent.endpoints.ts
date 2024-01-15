import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { Events } from "../../io/http/index.js";
import { ResourceEndpoints } from "../types.js";

const SinglePatentOutput = Output(Events.Patent.Patent, "Patent");
const ListPatentsOutput = ListOutput(Events.Patent.Patent, "Patents");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/patents",
  Input: {
    Query: Events.Patent.PatentListQuery.type,
  },
  Output: ListPatentsOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/patents/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SinglePatentOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/patents",
  Input: {
    Query: undefined,
    Body: t.strict(
      propsOmit(Events.Patent.CreatePatentBody, ["type"]),
      "CreateDeathBody",
    ),
  },
  Output: SinglePatentOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/patents/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict(
      propsOmit(Events.Patent.EditPatentBody, ["type"]),
      "EditPatentBody",
    ),
  },
  Output: SinglePatentOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/patents/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
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
