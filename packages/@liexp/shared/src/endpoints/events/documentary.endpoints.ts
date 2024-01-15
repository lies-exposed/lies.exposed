import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { Events } from "../../io/http/index.js";
import { ResourceEndpoints } from "../types.js";

const SingleDocumentaryOutput = Output(
  Events.Documentary.Documentary,
  "Documentary",
);
const ListDocumentariesOutput = ListOutput(
  Events.Documentary.Documentary,
  "Documentaries",
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/documentaries",
  Input: {
    Query: Events.Documentary.DocumentaryListQuery.type,
  },
  Output: ListDocumentariesOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/documentaries/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleDocumentaryOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/documentaries",
  Input: {
    Query: undefined,
    Body: t.strict(
      propsOmit(Events.Documentary.CreateDocumentaryBody, ["type"]),
      "CreateDocumentaryReleaseBody",
    ),
  },
  Output: SingleDocumentaryOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/documentaries/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict(
      propsOmit(Events.Documentary.EditDocumentaryBody, ["type"]),
      "EditDocumentaryReleaseBody",
    ),
  },
  Output: SingleDocumentaryOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/documentaries/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleDocumentaryOutput,
});

export const documentaries = ResourceEndpoints({
  Create,
  Edit,
  List,
  Get,
  Delete,
  Custom: {},
});
