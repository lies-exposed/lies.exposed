import { OptionFromNullishToNull } from "@liexp/io/lib/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { UUID } from "@liexp/io/lib/http/Common/index.js";
import {
  CreateScientificStudyBody,
  ScientificStudy,
} from "@liexp/io/lib/http/Events/ScientificStudy.js";
import { GetSearchEventsQuery } from "@liexp/io/lib/http/Events/SearchEvents/SearchEventsQuery.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const SingleStudyOutput = Output(ScientificStudy).annotations({
  title: "ScientificStudy",
});
const ListStudyOutput = ListOutput(ScientificStudy, "Deaths");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/scientific-studies",
  Input: {
    Query: Schema.Struct({
      ...GetSearchEventsQuery.fields,
      provider: OptionFromNullishToNull(UUID),
      publishedDate: OptionFromNullishToNull(Schema.Date),
      authors: OptionFromNullishToNull(Schema.Array(UUID)),
    }),
  },
  Output: ListStudyOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/scientific-studies/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleStudyOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/scientific-studies",
  Input: {
    Query: undefined,
    Body: CreateScientificStudyBody,
  },
  Output: SingleStudyOutput,
});

// export const CreateFromURL = Endpoint({
//   Method: "POST",
//   getPath: () => "/scientific-studies/from-url",
//   Input: {
//     Query: undefined,
//     Body: Schema.Struct({
//       url: URL,
//     }),
//   },
//   Output: SingleStudyOutput,
// });

export const ExtractFromURL = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/scientific-studies/${id}/extract`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleStudyOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/scientific-studies/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: CreateScientificStudyBody.omit("type"),
  },
  Output: SingleStudyOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/scientific-studies/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleStudyOutput,
});

export const scientificStudies = ResourceEndpoints({
  Get,
  List,
  Create,
  Edit,
  Delete,
  Custom: {
    // CreateFromURL,
    ExtractFromURL,
  },
});
