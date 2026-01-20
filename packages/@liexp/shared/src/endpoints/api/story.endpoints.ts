import { BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { OptionFromNullishToNull } from "@liexp/io/lib/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "@liexp/io/lib/http/Common/Output.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { GetListQuery } from "@liexp/io/lib/http/Query/index.js";
import { Story } from "@liexp/io/lib/http/index.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

const StoryOutput = Output(Story.Story).annotations({ title: "StoryOutput" });
const GetListStoryQuery = Schema.Struct({
  ...GetListQuery.fields,
  draft: OptionFromNullishToNull(Schema.BooleanFromString),
  exclude: OptionFromNullishToNull(Schema.Array(UUID)),
  path: OptionFromNullishToNull(Schema.String),
  creator: OptionFromNullishToNull(UUID),
  withDeleted: OptionFromNullishToNull(Schema.BooleanFromString),
}).annotations({ title: "GetListStoryQuery" });

export const ListStory = Endpoint({
  Method: "GET",
  getPath: () => "/stories",
  Input: {
    Query: GetListStoryQuery,
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
      date: Schema.Date,
      featuredImage: OptionFromNullishToNull(UUID),
      creator: OptionFromNullishToNull(UUID),
      body2: BlockNoteDocument,
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
