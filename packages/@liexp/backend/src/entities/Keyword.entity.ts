import {
  type Tag,
  type Color,
  type UUID,
} from "@liexp/shared/lib/io/http/Common/index.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity.js";
import { LinkEntity } from "./Link.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";
import { StoryEntity } from "./Story.entity.js";

export const KEYWORD_ENTITY_NAME = "keyword";
@Entity(KEYWORD_ENTITY_NAME)
@Index(["tag"], { unique: true })
export class KeywordEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar", nullable: false })
  tag: Tag;

  @Column({ type: "varchar", length: 6, nullable: true })
  color: Color | null;

  @ManyToMany(() => EventV2Entity, (e) => e.keywords, { cascade: false })
  events: Relation<EventV2Entity[]>;

  @ManyToMany(() => LinkEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  links: Relation<LinkEntity[]>;

  @ManyToMany(() => StoryEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  stories: Relation<StoryEntity[]>;

  @ManyToMany(() => MediaEntity, (e) => e.keywords, {
    cascade: false,
  })
  @JoinTable()
  media: Relation<MediaEntity[]>;

  // admin props
  socialPosts?: SocialPostEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  eventCount: number;

  linkCount: number;
}
