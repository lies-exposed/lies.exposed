import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type CreateSocialPost,
  SocialPostStatus,
  type SocialPostPublishResult,
  type SocialPostResourceType,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { Column, Entity, Index, Relation } from "typeorm";
import { type LinkEntity } from "./Link.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const SOCIAL_POST_ENTITY_NAME = "social_post";

@Entity(SOCIAL_POST_ENTITY_NAME)
@Index(["type", "entity"])
export class SocialPostEntity extends DeletableEntity {
  @Column({ type: "uuid" })
  entity: UUID;

  @Column({ type: "varchar" })
  type: SocialPostResourceType;

  @Column({ type: "json", nullable: false })
  content: Omit<
    CreateSocialPost,
    "actors" | "groups" | "keywords" | "media"
  > & {
    actors: readonly UUID[];
    groups: readonly UUID[];
    keywords: readonly UUID[];
    media: readonly UUID[];
  };

  @Column({
    type: "simple-enum",
    enum: SocialPostStatus.members.map((t) => t.literals[0]),
  })
  status: SocialPostStatus;

  @Column({ type: "json", nullable: true })
  result: SocialPostPublishResult;

  @Column({ type: "timestamptz" })
  scheduledAt: Date;

  links?: Relation<LinkEntity[]>;

  publishCount: number;
}
