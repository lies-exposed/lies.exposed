import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import { Actor } from "../io/http";
import { UUID } from "../io/http/Common";
import { ListOutput, Output } from "../io/http/Common/Output";
import { SocialPost, ShareMessageResourceType } from '../io/http/SocialPost';
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
    Params: t.type({ id: UUID, type: ShareMessageResourceType }),
    Body: SocialPost,
  },
  Output: SingleSocialPostOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/social-posts/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: nonEmptyRecordFromType({
      username: optionFromNullable(t.string),
      fullName: optionFromNullable(t.string),
      color: optionFromNullable(t.string),
      excerpt: optionFromNullable(t.UnknownRecord),
      body: optionFromNullable(t.UnknownRecord),
      avatar: optionFromNullable(t.string),
      bornOn: optionFromNullable(DateFromISOString),
      diedOn: optionFromNullable(DateFromISOString),
      memberIn: optionFromNullable(
        t.array(
          t.union([
            UUID,
            t.strict({
              group: UUID,
              body: t.UnknownRecord,
              startDate: DateFromISOString,
              endDate: optionFromNullable(DateFromISOString),
            }),
          ])
        )
      ),
    }),
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
