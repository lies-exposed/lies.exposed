import { type URL, type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity.js";
import { KeywordEntity } from "./Keyword.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";
import { UserEntity } from "./User.entity.js";

export const LINK_ENTITY_NAME = "link";

@Entity(LINK_ENTITY_NAME)
@Index(["url"], { unique: true })
export class LinkEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar", nullable: false, unique: true })
  url: URL;

  @Column({ type: "varchar", nullable: true })
  title: string;

  @Column({ type: "varchar", nullable: true })
  description: string | null;

  @ManyToOne(() => MediaEntity, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinColumn()
  image: Relation<MediaEntity | null>;

  @Column({ type: "timestamptz", nullable: true })
  publishDate: Date | null;

  @Column({ type: "varchar", nullable: true })
  provider: UUID | null;

  @ManyToOne(() => UserEntity, (u) => u.links, {
    nullable: true,
    cascade: false,
  })
  creator: Relation<UserEntity | null>;

  @ManyToMany(() => EventV2Entity, (e) => e.links, {
    cascade: false,
  })
  events: Relation<EventV2Entity[]>;

  @ManyToMany(() => KeywordEntity, (e) => e.links, {
    cascade: false,
  })
  keywords: Relation<KeywordEntity[]>;

  socialPosts?: SocialPostEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
