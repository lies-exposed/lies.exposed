import { type SelectQueryBuilder } from "typeorm";
import { SocialPostEntity } from "@entities/SocialPost.entity";

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
        .where("socialPost.type = :type", {
          type,
        })
        .groupBy("socialPost.entity");
    }, "sp");

    
  };
