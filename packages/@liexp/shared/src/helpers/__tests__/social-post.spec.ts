import { describe, test, expect } from "vitest";
import {
  getSocialPostRelationIds,
  socialPostRelationIdsMonoid,
} from "../social-post.js";

describe("@helpers/social-post", () => {
  const post = {
    keywords: [{ id: "k1" }],
    media: [{ id: "m1" }],
    actors: [{ id: "a1" }],
    groups: [{ id: "g1" }],
  };

  test("getSocialPostRelationIds extracts ids", () => {
    expect(getSocialPostRelationIds(post)).toEqual({
      keywords: ["k1"],
      media: ["m1"],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("socialPostRelationIdsMonoid concat merges unique ids", () => {
    const a = {
      keywords: ["k1"],
      media: ["m1"],
      actors: ["a1"],
      groups: ["g1"],
    };
    const b = {
      keywords: ["k2", "k1"],
      media: ["m2"],
      actors: ["a2"],
      groups: ["g2"],
    };
    expect(socialPostRelationIdsMonoid.concat(a, b)).toEqual({
      keywords: ["k1", "k2"],
      media: ["m1", "m2"],
      actors: ["a1", "a2"],
      groups: ["g1", "g2"],
    });
  });
});
