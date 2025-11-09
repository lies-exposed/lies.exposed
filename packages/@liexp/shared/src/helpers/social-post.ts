import { type Monoid } from "fp-ts/lib/Monoid.js";
import { pipe } from "fp-ts/lib/function.js";
import { type UUID } from "../io/http/Common/UUID.js";
import { type SocialPost } from "../io/http/SocialPost.js";

export interface SocialPostRelationIds {
  keywords: readonly UUID[];
  media: readonly UUID[];
  actors: readonly UUID[];
  groups: readonly UUID[];
}

export const getSocialPostRelationIds = (
  ev: SocialPost,
): SocialPostRelationIds => {
  return {
    keywords: (ev.keywords ?? []).map((k) => k.id),
    media: (Array.isArray(ev.media) ? ev.media : []).map((m) => m.id),
    actors: (ev.actors ?? []).map((a) => a.id),
    groups: (ev.groups ?? []).map((g) => g.id),
  };
};

export const socialPostRelationIdsMonoid: Monoid<SocialPostRelationIds> = {
  empty: {
    keywords: [],
    actors: [],
    groups: [],
    media: [],
  },
  concat: (x, y) => ({
    keywords: x.keywords.concat(
      y.keywords.filter((a) => !x.keywords.includes(a)),
    ),
    // links: x.links.concat(y.links.filter((a) => !x.links.includes(a))),
    media: x.media.concat(y.media.filter((a) => !x.media.includes(a))),
    actors: x.actors.concat(y.actors.filter((a) => !x.actors.includes(a))),
    groups: x.groups.concat(y.groups.filter((a) => !x.groups.includes(a))),
    // areas: x.areas.concat(y.areas.filter((a) => !x.areas.includes(a))),
  }),
};

export const takeSocialPostRelations = (
  ev: readonly SocialPost[],
): SocialPostRelationIds => {
  return pipe(
    ev.reduce(
      (acc, e) =>
        socialPostRelationIdsMonoid.concat(acc, getSocialPostRelationIds(e)),
      socialPostRelationIdsMonoid.empty,
    ),
  );
};
