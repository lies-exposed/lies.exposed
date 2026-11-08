import type { SocialPost } from "@liexp/io/lib/http/SocialPost.js";
import { describe, test, expect } from "vitest";
import {
  getSocialPostRelationIds,
  socialPostRelationIdsMonoid,
  takeSocialPostRelations,
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

  test("getSocialPostRelationIds handles null keywords", () => {
    expect(
      getSocialPostRelationIds({ ...post, keywords: null as unknown as [] }),
    ).toEqual({
      keywords: [],
      media: ["m1"],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("getSocialPostRelationIds handles undefined keywords", () => {
    const { keywords: _, ...rest } = post;
    expect(
      getSocialPostRelationIds(rest as typeof post & { keywords: undefined }),
    ).toEqual({
      keywords: [],
      media: ["m1"],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("getSocialPostRelationIds handles null media", () => {
    expect(
      getSocialPostRelationIds({ ...post, media: null as unknown as [] }),
    ).toEqual({
      keywords: ["k1"],
      media: [],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("getSocialPostRelationIds handles undefined media", () => {
    const { media: _, ...rest } = post;
    expect(
      getSocialPostRelationIds(rest as typeof post & { media: undefined }),
    ).toEqual({
      keywords: ["k1"],
      media: [],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("getSocialPostRelationIds handles media as non-array", () => {
    // Source has: Array.isArray(ev.media) ? ev.media : []
    expect(
      getSocialPostRelationIds({
        ...post,
        media: "not-an-array" as unknown as [],
      }),
    ).toEqual({
      keywords: ["k1"],
      media: [],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("getSocialPostRelationIds handles null actors", () => {
    expect(
      getSocialPostRelationIds({ ...post, actors: null as unknown as [] }),
    ).toEqual({
      keywords: ["k1"],
      media: ["m1"],
      actors: [],
      groups: ["g1"],
    });
  });

  test("getSocialPostRelationIds handles null groups", () => {
    expect(
      getSocialPostRelationIds({ ...post, groups: null as unknown as [] }),
    ).toEqual({
      keywords: ["k1"],
      media: ["m1"],
      actors: ["a1"],
      groups: [],
    });
  });

  test("getSocialPostRelationIds handles all nullish fields", () => {
    expect(
      getSocialPostRelationIds({
        keywords: null,
        media: null,
        actors: null,
        groups: null,
      } as unknown as typeof post),
    ).toEqual({
      keywords: [],
      media: [],
      actors: [],
      groups: [],
    });
  });

  test("getSocialPostRelationIds handles empty arrays", () => {
    expect(
      getSocialPostRelationIds({
        keywords: [],
        media: [],
        actors: [],
        groups: [],
      } as unknown as typeof post),
    ).toEqual({
      keywords: [],
      media: [],
      actors: [],
      groups: [],
    });
  });

  test("getSocialPostRelationIds handles multiple relations per type", () => {
    expect(
      getSocialPostRelationIds({
        keywords: [{ id: "k1" }, { id: "k2" }, { id: "k3" }],
        media: [{ id: "m1" }, { id: "m2" }],
        actors: [{ id: "a1" }],
        groups: [{ id: "g1" }],
      }),
    ).toEqual({
      keywords: ["k1", "k2", "k3"],
      media: ["m1", "m2"],
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

  test("socialPostRelationIdsMonoid concat with empty left", () => {
    expect(
      socialPostRelationIdsMonoid.concat(socialPostRelationIdsMonoid.empty, {
        keywords: ["k1"],
        media: ["m1"],
        actors: ["a1"],
        groups: ["g1"],
      }),
    ).toEqual({
      keywords: ["k1"],
      media: ["m1"],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("socialPostRelationIdsMonoid concat with empty right", () => {
    expect(
      socialPostRelationIdsMonoid.concat(
        {
          keywords: ["k1"],
          media: ["m1"],
          actors: ["a1"],
          groups: ["g1"],
        },
        socialPostRelationIdsMonoid.empty,
      ),
    ).toEqual({
      keywords: ["k1"],
      media: ["m1"],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("socialPostRelationIdsMonoid empty has all empty arrays", () => {
    expect(socialPostRelationIdsMonoid.empty).toEqual({
      keywords: [],
      actors: [],
      groups: [],
      media: [],
    });
  });

  test("socialPostRelationIdsMonoid concat is associative", () => {
    const a = {
      keywords: ["k1"],
      media: ["m1"],
      actors: ["a1"],
      groups: ["g1"],
    };
    const b = {
      keywords: ["k2"],
      media: ["m2"],
      actors: ["a2"],
      groups: ["g2"],
    };
    const c = {
      keywords: ["k3"],
      media: ["m3"],
      actors: ["a3"],
      groups: ["g3"],
    };
    const left = socialPostRelationIdsMonoid.concat(
      socialPostRelationIdsMonoid.concat(a, b),
      c,
    );
    const right = socialPostRelationIdsMonoid.concat(
      a,
      socialPostRelationIdsMonoid.concat(b, c),
    );
    expect(left).toEqual(right);
  });

  test("takeSocialPostRelations aggregates from single post", () => {
    const posts = [
      {
        keywords: [{ id: "k1" }],
        media: [{ id: "m1" }],
        actors: [{ id: "a1" }],
        groups: [{ id: "g1" }],
      } as unknown as SocialPost,
    ];
    expect(takeSocialPostRelations(posts)).toEqual({
      keywords: ["k1"],
      media: ["m1"],
      actors: ["a1"],
      groups: ["g1"],
    });
  });

  test("takeSocialPostRelations aggregates from multiple posts", () => {
    const posts = [
      {
        keywords: [{ id: "k1" }],
        media: [{ id: "m1" }],
        actors: [{ id: "a1" }],
        groups: [{ id: "g1" }],
      } as unknown as SocialPost,
      {
        keywords: [{ id: "k2" }, { id: "k1" }],
        media: [{ id: "m2" }],
        actors: [{ id: "a2" }],
        groups: [{ id: "g1" }],
      } as unknown as SocialPost,
    ];
    expect(takeSocialPostRelations(posts)).toEqual({
      keywords: ["k1", "k2"],
      media: ["m1", "m2"],
      actors: ["a1", "a2"],
      groups: ["g1"],
    });
  });

  test("takeSocialPostRelations returns empty for empty array", () => {
    expect(takeSocialPostRelations([])).toEqual({
      keywords: [],
      media: [],
      actors: [],
      groups: [],
    });
  });

  test("takeSocialPostRelations deduplicates across posts", () => {
    const posts = [
      {
        keywords: [{ id: "k1" }, { id: "k2" }],
        media: [{ id: "m1" }],
        actors: [{ id: "a1" }],
        groups: [{ id: "g1" }],
      } as unknown as SocialPost,
      {
        keywords: [{ id: "k2" }, { id: "k3" }],
        media: [{ id: "m1" }, { id: "m2" }],
        actors: [{ id: "a1" }, { id: "a2" }],
        groups: [{ id: "g1" }, { id: "g2" }],
      } as unknown as SocialPost,
    ];
    expect(takeSocialPostRelations(posts)).toEqual({
      keywords: ["k1", "k2", "k3"],
      media: ["m1", "m2"],
      actors: ["a1", "a2"],
      groups: ["g1", "g2"],
    });
  });
});
