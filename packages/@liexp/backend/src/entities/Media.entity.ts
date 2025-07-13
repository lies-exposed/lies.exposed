import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  MediaType,
  type MediaExtra,
} from "@liexp/shared/lib/io/http/Media/index.js";
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  type Relation,
} from "typeorm";
import { AreaEntity } from "./Area.entity.js";
import { EventV2Entity } from "./Event.v2.entity.js";
import { KeywordEntity } from "./Keyword.entity.js";
import { LinkEntity } from "./Link.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";
import { StoryEntity } from "./Story.entity.js";
import { UserEntity } from "./User.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const MEDIA_ENTITY_NAME = "image";

@Entity(MEDIA_ENTITY_NAME)
export class MediaEntity extends DeletableEntity {
  @Column({ type: "varchar", nullable: true })
  label: string | null;

  @Column({ type: "varchar", nullable: true })
  thumbnail: URL | null;

  @Column({ type: "varchar", nullable: false, unique: true })
  location: URL;

  @Column({ type: "varchar", nullable: true })
  description: string | null;

  @Column({
    type: "enum",
    enum: MediaType.members.map((t) => t.literals[0]),
    default: MediaType.members[0].literals[0],
  })
  type: MediaType;

  @ManyToOne(() => UserEntity, (u) => u.media, {
    cascade: false,
    nullable: true,
  })
  @JoinTable()
  creator: Relation<UserEntity> | null;

  @Column({
    type: "json",
    nullable: true,
  })
  extra: Relation<MediaExtra> | null;

  @ManyToMany(() => EventV2Entity, (e) => e.media, {
    cascade: false,
  })
  events: Relation<EventV2Entity[]>;

  @OneToMany(() => LinkEntity, (e) => e.image, {
    cascade: false,
  })
  links: Relation<LinkEntity[]>;

  @ManyToMany(() => AreaEntity, (a) => a.media, {
    cascade: false,
  })
  areas: Relation<AreaEntity[]>;

  @OneToMany(() => AreaEntity, (a) => a.featuredImage, {
    cascade: false,
  })
  featuredInAreas: Relation<AreaEntity[]>;

  @OneToMany(() => StoryEntity, (a) => a.featuredImage, {
    cascade: false,
  })
  featuredInStories: Relation<StoryEntity[]>;

  @ManyToMany(() => StoryEntity, (a) => a.media, {
    cascade: false,
  })
  stories: Relation<StoryEntity[]>;

  @ManyToMany(() => KeywordEntity, (a) => a.media, {
    cascade: false,
  })
  keywords: Relation<KeywordEntity[]>;

  socialPosts?: Relation<SocialPostEntity>[];
}
