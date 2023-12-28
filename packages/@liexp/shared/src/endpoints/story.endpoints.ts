import * as t from "io-ts";
import { UUID } from "io-ts-types/UUID";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Story } from "../io/http";
import { ListOutput, Output } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const ListStoryQuery = t.type(
  {
    ...GetListQuery.props,
    draft: optionFromNullable(BooleanFromString),
    exclude: optionFromNullable(t.array(UUID)),
    path: optionFromNullable(t.string),
    creator: optionFromNullable(UUID),
  },
  "ListStoryQuery",
);

export const ListStory = Endpoint({
  Method: "GET",
  getPath: () => "/stories",
  Input: {
    Query: ListStoryQuery,
  },
  Output: ListOutput(Story.Story, "Story"),
});

export const GetStory = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/stories/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: Output(Story.Story, "Story"),
});

export const CreateStory = Endpoint({
  Method: "POST",
  getPath: () => "/stories",
  Input: {
    Body: t.strict(
      {
        title: t.string,
        path: t.string,
        draft: t.boolean,
        date: DateFromISOString,
        featuredImage: optionFromNullable(UUID),
        creator: optionFromNullable(UUID),
        body2: t.unknown,
        keywords: t.array(UUID),
        actors: t.array(UUID),
        groups: t.array(UUID),
        events: t.array(UUID),
        media: t.array(UUID),
      },
      "CreateStoryBody",
    ),
  },
  Output: Output(Story.Story, "Story"),
});

const EditStory = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/stories/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: Story.EditStoryBody,
  },
  Output: Output(Story.Story, "Story"),
});

const DeleteStory = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/stories/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: Output(Story.Story, "Story"),
});

export const stories = ResourceEndpoints({
  Get: GetStory,
  List: ListStory,
  Create: CreateStory,
  Edit: EditStory,
  Delete: DeleteStory,
  Custom: {},
});
