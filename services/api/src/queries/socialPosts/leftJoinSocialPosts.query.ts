import { type SelectQueryBuilder } from "typeorm";
import { SocialPostEntity } from "#entities/SocialPost.entity.js";

export const aggregateSocialPostsPerEntry = (
  key: string,
  list: Array<{ socialPosts_ids: string[]; [index: string]: any }>,
  e: { id: string },
): string[] => {
  return list
    .filter((r) => r[key] === e.id && !!r.socialPosts_ids)
    .reduce<string[]>((acc, r) => {
      r.socialPosts_ids.forEach((id: string) => {
        if (!acc.includes(id)) {
          acc.push(id);
        }
      });
      return acc;
    }, []);
};

export const leftJoinSocialPosts =
  (type: string) =>
  (subQ: SelectQueryBuilder<any>): SelectQueryBuilder<any> => {
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
