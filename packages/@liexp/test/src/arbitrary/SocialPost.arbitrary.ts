import * as SocialPost from "@liexp/io/lib/http/SocialPost.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { URLArb } from "./URL.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const CreateSocialPostArb = Arbitrary.make(
  SocialPost.CreateSocialPost.omit("url", "actors", "groups", "keywords"),
).map((post) => ({
  ...post,
  url: fc.sample(URLArb, 1)[0],
  actors: [],
  groups: [],
  keywords: [],
  media: [],
}));

export const SocialPostArb = Arbitrary.make(
  SocialPost.SocialPost.omit("id", "url"),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  url: fc.sample(URLArb, 1)[0],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
