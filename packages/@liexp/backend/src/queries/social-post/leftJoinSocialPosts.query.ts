import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type ObjectLiteral, type SelectQueryBuilder } from "typeorm";
import { SocialPostEntity } from "../../entities/SocialPost.entity.js";

export const aggregateSocialPostsPerEntry = (
  key: string,
  list: { socialPosts_ids: UUID[]; [index: string]: any }[],
  e: { id: string },
): UUID[] => {
  return list
    .filter((r) => r[key] === e.id && !!r.socialPosts_ids)
    .reduce<UUID[]>((acc, r) => {
      r.socialPosts_ids.forEach((id: UUID) => {
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
