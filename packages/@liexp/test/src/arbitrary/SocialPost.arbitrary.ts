import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const CreateSocialPostArb = Arbitrary.make(
  http.SocialPost.CreateSocialPost.omit("actors", "groups", "keywords"),
).map((post) => ({ ...post, actors: [], groups: [], keywords: [], media: [] }));

export const SocialPostArb = Arbitrary.make(
  http.SocialPost.SocialPost.omit("id"),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
