import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import { Image } from "../io/http";
import { ListOutput, Output } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleImageOutput = Output(Image.Image, "Image");
const ListImageOutput = ListOutput(Image.Image, "Images");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/images",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      events: optionFromNullable(t.array(t.string)),
      ids: optionFromNullable(t.array(t.string)),
    }),
  },
  Output: ListImageOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/images/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: t.unknown,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/images",
  Input: {
    Query: undefined,
    Body: t.strict(
      {
        location: t.string,
        description: t.string,
        events: t.array(t.string),
      },
      "CreateImageBody"
    ),
  },
  Output: SingleImageOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/images/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: nonEmptyRecordFromType({
      location: t.string,
      description: t.string,
      // events: t.array(t.string),
    }),
  },
  Output: SingleImageOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/images/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleImageOutput,
});

export const images = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
});
