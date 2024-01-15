import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import { UUID } from "../io/http/Common/index.js";
import {
  CreateSocialPost,
  EditSocialPost,
  GetListSocialPostQuery,
  SocialPost,
  SocialPostResourceType,
} from "../io/http/SocialPost.js";
import { ResourceEndpoints } from "./types.js";

export const SingleSocialPostOutput = Output(SocialPost, "SocialPost");
export type SingleSocialPostOutput = t.TypeOf<typeof SingleSocialPostOutput>;

export const ListSocialPostOutput = ListOutput(SocialPost, "SocialPosts");
export type ListSocialPostOutput = t.TypeOf<typeof ListSocialPostOutput>;

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
    Params: t.type({ id: UUID }),
  },
  Output: SingleSocialPostOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: ({ id, type }) => `/social-posts/${type}/${id}`,
  Input: {
    Params: t.type({ id: UUID, type: SocialPostResourceType }),
    Body: CreateSocialPost,
  },
  Output: SingleSocialPostOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/social-posts/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: EditSocialPost,
  },
  Output: SingleSocialPostOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/social-posts/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleSocialPostOutput,
});

export const Publish = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/social-posts/${id}/publish`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.type({
      platforms: t.type({
        IG: optionFromNullable(t.boolean),
        TG: optionFromNullable(t.boolean),
      }),
    }),
  },
  Output: SingleSocialPostOutput,
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
