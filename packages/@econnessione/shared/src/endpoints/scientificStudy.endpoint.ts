import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { URL, UUID } from "../io/http/Common";
import { ListOutput, Output } from "../io/http/Common/Output";
import {
  CreateScientificStudyBody,
  ScientificStudy,
} from "../io/http/Events/ScientificStudy";
import { GetListQuery } from "../io/http/Query";
import { propsOmit } from "../tests/arbitrary/utils.arbitrary";
import { ResourceEndpoints } from "./types";

const SingleStudyOutput = Output(ScientificStudy, "Death");
const ListStudyOutput = ListOutput(ScientificStudy, "Deaths");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/scientific-studies",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      publishedBy: optionFromNullable(t.array(UUID)),
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
    Params: t.type({ id: t.string }),
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

export const CreateFromURL = Endpoint({
  Method: "POST",
  getPath: () => "/scientific-studies/url",
  Input: {
    Query: undefined,
    Body: t.strict({
      url: URL,
      date: DateFromISOString,
    }),
  },
  Output: SingleStudyOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/scientific-studies/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: t.strict(
      propsOmit(CreateScientificStudyBody, ["type"]),
      "CreateScientificStudyBody"
    ),
  },
  Output: SingleStudyOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/scientific-studies/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
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
    CreateFromURL
  },
});
