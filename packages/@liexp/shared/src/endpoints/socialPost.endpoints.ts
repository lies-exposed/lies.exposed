import { Schema } from "effect";
import { Endpoint, ResourceEndpoints } from "ts-endpoint";
import { OptionFromNullishToNull } from "../io/http/Common/OptionFromNullishToNull.js";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/index.js";
import {
  CreateSocialPost,
  EditSocialPost,
  GetListSocialPostQuery,
  SocialPost,
  SocialPostResourceType,
} from "../io/http/SocialPost.js";

export const SingleSocialPostOutput = Output(SocialPost).annotations({
  title: "SocialPost",
});
export type SingleSocialPostOutput = typeof SingleSocialPostOutput.Type;

export const ListSocialPostOutput = ListOutput(SocialPost, "SocialPosts");
export type ListSocialPostOutput = typeof ListSocialPostOutput.Type;

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/social-posts",
  Input: {
    Query: GetListSocialPostQuery,
  },
  Output: ListSocialPostOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/social-posts/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleSocialPostOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: ({ id, type }) => `/social-posts/${type}/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID, type: SocialPostResourceType }),
    Body: CreateSocialPost,
  },
  Output: Output(
    Schema.Union(SocialPost, Schema.Struct({ success: Schema.Boolean })),
  ),
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/social-posts/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: EditSocialPost,
  },
  Output: SingleSocialPostOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/social-posts/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleSocialPostOutput,
});

export const Publish = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/social-posts/${id}/publish`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Schema.Struct({
      platforms: Schema.Struct({
        IG: OptionFromNullishToNull(Schema.Boolean),
        TG: OptionFromNullishToNull(Schema.Boolean),
      }),
    }),
  },
  Output: Output(Schema.Boolean).annotations({ title: "SocialPostPublish" }),
});

export const socialPosts = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {
    Publish,
  },
});
