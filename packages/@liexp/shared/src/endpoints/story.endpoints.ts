import { Schema } from "effect";
import { Endpoint } from "ts-endpoint";
import { OptionFromNullishToNull } from "../io/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/UUID.js";
import { GetListQuery } from "../io/http/Query/index.js";
import { Story } from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";

const StoryOutput = Output(Story.Story).annotations({ title: "StoryOutput" });
const ListStoryQuery = Schema.Struct({
  ...GetListQuery.fields,
  draft: OptionFromNullishToNull(Schema.BooleanFromString),
  exclude: OptionFromNullishToNull(Schema.Array(UUID)),
  path: OptionFromNullishToNull(Schema.String),
  creator: OptionFromNullishToNull(UUID),
}).annotations({ title: "ListStoryQuery" });

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
    Params: Schema.Struct({ id: UUID }),
  },
  Output: StoryOutput,
});

export const CreateStory = Endpoint({
  Method: "POST",
  getPath: () => "/stories",
  Input: {
    Body: Schema.Struct({
      title: Schema.String,
      path: Schema.String,
      draft: Schema.Boolean,
      date: Schema.DateFromString,
      featuredImage: OptionFromNullishToNull(UUID),
      creator: OptionFromNullishToNull(UUID),
      body2: Schema.Unknown,
      keywords: Schema.Array(UUID),
      actors: Schema.Array(UUID),
      groups: Schema.Array(UUID),
      events: Schema.Array(UUID),
      media: Schema.Array(UUID),
    }).annotations({ title: "CreateStoryBody" }),
  },
  Output: StoryOutput,
});

const EditStory = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/stories/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Story.EditStoryBody,
  },
  Output: StoryOutput,
});

const DeleteStory = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/stories/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: StoryOutput,
});

export const stories = ResourceEndpoints({
  Get: GetStory,
  List: ListStory,
  Create: CreateStory,
  Edit: EditStory,
  Delete: DeleteStory,
  Custom: {},
});
