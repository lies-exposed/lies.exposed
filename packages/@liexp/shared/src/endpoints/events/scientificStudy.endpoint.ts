import { Schema } from "effect";
import { Endpoint, ResourceEndpoints } from "ts-endpoint";
import { OptionFromNullishToNull } from "../../io/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { UUID } from "../../io/http/Common/index.js";
import {
  CreateScientificStudyBody,
  ScientificStudy,
} from "../../io/http/Events/ScientificStudy.js";
import { GetSearchEventsQuery } from "../../io/http/Events/SearchEvents/SearchEventsQuery.js";

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
