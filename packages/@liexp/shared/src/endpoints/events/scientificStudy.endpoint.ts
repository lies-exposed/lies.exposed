import { propsOmit } from "@liexp/core/lib/io/utils";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { UUID } from "../../io/http/Common";
import { ListOutput, Output } from "../../io/http/Common/Output";
import {
  CreateScientificStudyBody,
  ScientificStudy,
} from "../../io/http/Events/ScientificStudy";
import { GetSearchEventsQuery } from "../../io/http/Events/SearchEvents/SearchEventsQuery";
import { ResourceEndpoints } from "../types";

const SingleStudyOutput = Output(ScientificStudy, "Death");
const ListStudyOutput = ListOutput(ScientificStudy, "Deaths");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/scientific-studies",
  Input: {
    Query: t.type({
      ...GetSearchEventsQuery.type.props,
      provider: optionFromNullable(UUID),
      publishedDate: optionFromNullable(DateFromISOString),
      authors: optionFromNullable(t.array(UUID)),
    }),
  },
  Output: ListStudyOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/scientific-studies/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
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
//     Body: t.strict({
//       url: URL,
//     }),
//   },
//   Output: SingleStudyOutput,
// });

export const ExtractFromURL = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/scientific-studies/${id}/extract`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleStudyOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/scientific-studies/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict(
      propsOmit(CreateScientificStudyBody.types[0], ["type"]),
      "CreateScientificStudyBody",
    ),
  },
  Output: SingleStudyOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/scientific-studies/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
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
