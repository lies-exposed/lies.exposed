import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { Actor } from "../io/http";
import { UUID } from "../io/http/Common";
import { ListOutput, Output } from "../io/http/Common/Output";
import {
  CreateSocialPost,
  SocialPost,
  SocialPostResourceType,
} from "../io/http/SocialPost";
import { ResourceEndpoints } from "./types";

export const SingleSocialPostOutput = Output(SocialPost, "Actor");
export type SingleSocialPostOutput = t.TypeOf<typeof SingleSocialPostOutput>;

export const ListSocialPostOutput = ListOutput(SocialPost, "Actors");
export type ListSocialPostOutput = t.TypeOf<typeof ListSocialPostOutput>;

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/social-posts",
  Input: {
    Query: Actor.GetListActorQuery,
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
    Body: SocialPost,
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

export const socialPosts = ResourceEndpoints({
  Get,
  List,
  Edit,
  Create,
  Delete,
  Custom: {},
});
