import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import type { SocialPost } from "@liexp/io/lib/http/SocialPost.js";
import { ctxHelper } from "@liexp/test";
import { describe, test, expect } from "vitest";
import {
  type SocialPostRelationIds,
  getSocialPostRelationIds,
  socialPostRelationIdsMonoid,
  takeSocialPostRelations,
} from "../social-post.js";

/** Stable branded uuids reused by fixtures and expectations. */
const K1 = uuid();
const K2 = uuid();
const K3 = uuid();
const M1 = uuid();
const M2 = uuid();
const A1 = uuid();
const A2 = uuid();
const G1 = uuid();
const G2 = uuid();

/**
 * SocialPost fixtures only exercise the relation fields; the helpers under
 * test never read the remaining post fields.
 */
interface RelationRefFixture {
  id: ReturnType<typeof uuid>;
}
type RelationsFixture = Partial<
  Record<
    "keywords" | "media" | "actors" | "groups",
    readonly RelationRefFixture[] | null | undefined | string
  >
>;

const socialPostFixture = (relations: RelationsFixture): SocialPost =>
  ctxHelper.ctx<SocialPost>(relations);

describe("@helpers/social-post", () => {
  const post = socialPostFixture({
    keywords: [{ id: K1 }],
    media: [{ id: M1 }],
    actors: [{ id: A1 }],
    groups: [{ id: G1 }],
  });

  test("getSocialPostRelationIds extracts ids", () => {
    expect(getSocialPostRelationIds(post)).toEqual({
      keywords: [K1],
      media: [M1],
      actors: [A1],
      groups: [G1],
    });
  });

  test("getSocialPostRelationIds handles null keywords", () => {
    expect(
      getSocialPostRelationIds(socialPostFixture({ ...post, keywords: null })),
    ).toEqual({
      keywords: [],
      media: [M1],
      actors: [A1],
      groups: [G1],
    });
  });

  test("getSocialPostRelationIds handles undefined keywords", () => {
    expect(
      getSocialPostRelationIds(
        socialPostFixture({ ...post, keywords: undefined }),
      ),
    ).toEqual({
      keywords: [],
      media: [M1],
      actors: [A1],
      groups: [G1],
    });
  });

  test("getSocialPostRelationIds handles null media", () => {
    expect(
      getSocialPostRelationIds(socialPostFixture({ ...post, media: null })),
    ).toEqual({
      keywords: [K1],
      media: [],
      actors: [A1],
      groups: [G1],
    });
  });

  test("getSocialPostRelationIds handles undefined media", () => {
    expect(
      getSocialPostRelationIds(
        socialPostFixture({ ...post, media: undefined }),
      ),
    ).toEqual({
      keywords: [K1],
      media: [],
      actors: [A1],
      groups: [G1],
    });
  });

  test("getSocialPostRelationIds handles media as non-array", () => {
    // Source has: Array.isArray(ev.media) ? ev.media : []
    expect(
      getSocialPostRelationIds(
        socialPostFixture({ ...post, media: "not-an-array" }),
      ),
    ).toEqual({
      keywords: [K1],
      media: [],
      actors: [A1],
      groups: [G1],
    });
  });

  test("getSocialPostRelationIds handles null actors", () => {
    expect(
      getSocialPostRelationIds(socialPostFixture({ ...post, actors: null })),
    ).toEqual({
      keywords: [K1],
      media: [M1],
      actors: [],
      groups: [G1],
    });
  });

  test("getSocialPostRelationIds handles null groups", () => {
    expect(
      getSocialPostRelationIds(socialPostFixture({ ...post, groups: null })),
    ).toEqual({
      keywords: [K1],
      media: [M1],
      actors: [A1],
      groups: [],
    });
  });

  test("getSocialPostRelationIds handles all nullish fields", () => {
    expect(
      getSocialPostRelationIds(
        socialPostFixture({
          keywords: null,
          media: null,
          actors: null,
          groups: null,
        }),
      ),
    ).toEqual({
      keywords: [],
      media: [],
      actors: [],
      groups: [],
    });
  });

  test("getSocialPostRelationIds handles empty arrays", () => {
    expect(
      getSocialPostRelationIds(
        socialPostFixture({
          keywords: [],
          media: [],
          actors: [],
          groups: [],
        }),
      ),
    ).toEqual({
      keywords: [],
      media: [],
      actors: [],
      groups: [],
    });
  });

  test("getSocialPostRelationIds handles multiple relations per type", () => {
    expect(
      getSocialPostRelationIds(
        socialPostFixture({
          keywords: [{ id: K1 }, { id: K2 }, { id: K3 }],
          media: [{ id: M1 }, { id: M2 }],
          actors: [{ id: A1 }],
          groups: [{ id: G1 }],
        }),
      ),
    ).toEqual({
      keywords: [K1, K2, K3],
      media: [M1, M2],
      actors: [A1],
      groups: [G1],
    });
  });

  test("socialPostRelationIdsMonoid concat merges unique ids", () => {
    const a: SocialPostRelationIds = {
      keywords: [K1],
      media: [M1],
      actors: [A1],
      groups: [G1],
    };
    const b: SocialPostRelationIds = {
      keywords: [K2, K1],
      media: [M2],
      actors: [A2],
      groups: [G2],
    };
    expect(socialPostRelationIdsMonoid.concat(a, b)).toEqual({
      keywords: [K1, K2],
      media: [M1, M2],
      actors: [A1, A2],
      groups: [G1, G2],
    });
  });

  test("socialPostRelationIdsMonoid concat with empty left", () => {
    expect(
      socialPostRelationIdsMonoid.concat(socialPostRelationIdsMonoid.empty, {
        keywords: [K1],
        media: [M1],
        actors: [A1],
        groups: [G1],
      }),
    ).toEqual({
      keywords: [K1],
      media: [M1],
      actors: [A1],
      groups: [G1],
    });
  });

  test("socialPostRelationIdsMonoid concat with empty right", () => {
    expect(
      socialPostRelationIdsMonoid.concat(
        {
          keywords: [K1],
          media: [M1],
          actors: [A1],
          groups: [G1],
        },
        socialPostRelationIdsMonoid.empty,
      ),
    ).toEqual({
      keywords: [K1],
      media: [M1],
      actors: [A1],
      groups: [G1],
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
    const a: SocialPostRelationIds = {
      keywords: [K1],
      media: [M1],
      actors: [A1],
      groups: [G1],
    };
    const b: SocialPostRelationIds = {
      keywords: [K2],
      media: [M2],
      actors: [A2],
      groups: [G2],
    };
    const c: SocialPostRelationIds = {
      keywords: [K3],
      media: [uuid()],
      actors: [uuid()],
      groups: [uuid()],
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
      socialPostFixture({
        keywords: [{ id: K1 }],
        media: [{ id: M1 }],
        actors: [{ id: A1 }],
        groups: [{ id: G1 }],
      }),
    ];
    expect(takeSocialPostRelations(posts)).toEqual({
      keywords: [K1],
      media: [M1],
      actors: [A1],
      groups: [G1],
    });
  });

  test("takeSocialPostRelations aggregates from multiple posts", () => {
    const posts = [
      socialPostFixture({
        keywords: [{ id: K1 }],
        media: [{ id: M1 }],
        actors: [{ id: A1 }],
        groups: [{ id: G1 }],
      }),
      socialPostFixture({
        keywords: [{ id: K2 }, { id: K1 }],
        media: [{ id: M2 }],
        actors: [{ id: A2 }],
        groups: [{ id: G1 }],
      }),
    ];
    expect(takeSocialPostRelations(posts)).toEqual({
      keywords: [K1, K2],
      media: [M1, M2],
      actors: [A1, A2],
      groups: [G1],
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
      socialPostFixture({
        keywords: [{ id: K1 }, { id: K2 }],
        media: [{ id: M1 }],
        actors: [{ id: A1 }],
        groups: [{ id: G1 }],
      }),
      socialPostFixture({
        keywords: [{ id: K2 }, { id: K3 }],
        media: [{ id: M1 }, { id: M2 }],
        actors: [{ id: A1 }, { id: A2 }],
        groups: [{ id: G1 }, { id: G2 }],
      }),
    ];
    expect(takeSocialPostRelations(posts)).toEqual({
      keywords: [K1, K2, K3],
      media: [M1, M2],
      actors: [A1, A2],
      groups: [G1, G2],
    });
  });
});
