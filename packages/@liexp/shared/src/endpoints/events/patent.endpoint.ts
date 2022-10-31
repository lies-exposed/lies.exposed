import { propsOmit } from "@liexp/core/io/utils";
import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { Events } from "../../io/http";
import { ListOutput, Output } from "../../io/http/Common/Output";
import { ResourceEndpoints } from "../types";

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
    Params: t.type({ id: t.string }),
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
      "CreateDeathBody"
    ),
  },
  Output: SinglePatentOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/patents/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: t.strict(
      propsOmit(Events.Patent.EditPatentBody, ["type"]),
      "EditPatentBody"
    ),
  },
  Output: SinglePatentOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/patents/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
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
