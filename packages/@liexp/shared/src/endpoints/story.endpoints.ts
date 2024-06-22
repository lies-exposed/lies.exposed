import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/BooleanFromString";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { GetListQuery } from "../io/http/Query/index.js";
import { Story } from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";

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
