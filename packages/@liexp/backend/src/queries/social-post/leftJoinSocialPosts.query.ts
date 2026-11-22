import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type ObjectLiteral, type SelectQueryBuilder } from "typeorm";
import { SocialPostEntity } from "../../entities/SocialPost.entity.js";

type SocialPostRawRow = {
  socialPosts_ids?: UUID[] | null;
} & Record<string, unknown>;

export const aggregateSocialPostsPerEntry = (
  key: string,
  list: SocialPostRawRow[],
  e: { id: string },
): UUID[] => {
  return list
    .filter((r) => r[key] === e.id && !!r.socialPosts_ids)
    .reduce<UUID[]>((acc, r) => {
      (r.socialPosts_ids ?? []).forEach((id) => {
        if (!acc.includes(id)) {
          acc.push(id);
        }
      });
      return acc;
    }, []);
};

export const leftJoinSocialPosts =
  (type: string) =>
  <T extends ObjectLiteral>(
    subQ: SelectQueryBuilder<T>,
  ): SelectQueryBuilder<T> => {
    return subQ.select("sp.*").from((qb) => {
      return qb
        .select([
          'count(socialPost.id) as "socialPosts_spCount"',
          'socialPost.entity as "socialPosts_entity"',
          'array_agg(socialPost.id) as "socialPosts_ids"',
        ])
        .from(SocialPostEntity, "socialPost")
        .where('"socialPost"."type" = :type', {
          type,
        })
        .groupBy("socialPost.entity");
    }, "sp");
  };
