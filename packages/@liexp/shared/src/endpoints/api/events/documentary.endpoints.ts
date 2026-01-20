import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as Documentary from "@liexp/io/lib/http/Events/Documentary.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const SingleDocumentaryOutput = Output(Documentary.Documentary).annotations({
  title: "Documentary",
});
const ListDocumentariesOutput = ListOutput(
  Documentary.Documentary,
  "Documentaries",
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/documentaries",
  Input: {
    Query: Documentary.DocumentaryListQuery,
  },
  Output: ListDocumentariesOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/documentaries/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleDocumentaryOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/documentaries",
  Input: {
    Query: undefined,
    Body: Documentary.CreateDocumentaryBody.omit("type").annotations({
      title: "CreateDocumentaryReleaseBody",
    }),
  },
  Output: SingleDocumentaryOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/documentaries/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Documentary.EditDocumentaryBody.omit("type").annotations({
      title: "EditDocumentaryReleaseBody",
    }),
  },
  Output: SingleDocumentaryOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/documentaries/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
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
