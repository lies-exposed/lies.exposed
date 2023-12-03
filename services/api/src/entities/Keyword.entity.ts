import {
  type Tag,
  type Color,
  type UUID,
} from "@liexp/shared/lib/io/http/Common";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity";
import { LinkEntity } from "./Link.entity";
import { MediaEntity } from "./Media.entity";
import { type SocialPostEntity } from "./SocialPost.entity";
import { StoryEntity } from "./Story.entity";

@Entity("keyword")
@Index(["tag"], { unique: true })
export class KeywordEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar", nullable: false })
  tag: Tag;

  @Column({ type: "varchar", length: 6, nullable: true })
  color: Color | null;

  @ManyToMany(() => EventV2Entity, (e) => e.keywords, { cascade: false })
  events: EventV2Entity[];

  @ManyToMany(() => LinkEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  links: LinkEntity[];

  @ManyToMany(() => StoryEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  stories: StoryEntity[];

  @ManyToMany(() => MediaEntity, (e) => e.keywords, {
    cascade: false,
  })
  @JoinTable()
  media: MediaEntity[];

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
