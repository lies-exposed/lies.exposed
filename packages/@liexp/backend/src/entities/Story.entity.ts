import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { ActorEntity } from "./Actor.entity.js";
import { EventV2Entity } from "./Event.v2.entity.js";
import { GroupEntity } from "./Group.entity.js";
import { KeywordEntity } from "./Keyword.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { UserEntity } from "./User.entity.js";

export const STORY_ENTITY_NAME = "story";

@Entity(STORY_ENTITY_NAME)
export class StoryEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "boolean", default: true })
  draft: boolean;

  @Column({ type: "varchar", unique: true, nullable: false })
  path: string;

  @Column({ type: "timestamptz", nullable: true })
  date: Date | null;

  @ManyToOne(() => MediaEntity, (v) => v.stories, {
    eager: true,
    cascade: false,
    nullable: true,
    onDelete: "NO ACTION",
  })
  featuredImage: Relation<MediaEntity | null>;

  @Column({ type: "varchar", nullable: true })
  excerpt: string | null;

  @Column({ type: "varchar" })
  body: string;

  @Column({ type: "json", nullable: true })
  body2: any[] | null;

  @ManyToOne(() => UserEntity, (u) => u.stories, {
    cascade: false,
    nullable: true,
  })
  creator: Relation<UserEntity | null>;

  @ManyToMany(() => KeywordEntity, (k) => k.stories, {
    cascade: false,
  })
  keywords: Relation<KeywordEntity[]>;

  @ManyToMany(() => ActorEntity, (k) => k.stories, {
    cascade: false,
  })
  actors: Relation<ActorEntity[]>;

  @ManyToMany(() => GroupEntity, (k) => k.stories, {
    cascade: false,
  })
  groups: Relation<GroupEntity[]>;

  @ManyToMany(() => MediaEntity, (k) => k.stories, {
    cascade: false,
  })
  @JoinTable()
  media: Relation<MediaEntity[]>;

  @ManyToMany(() => EventV2Entity, (k) => k.stories, {
    cascade: false,
  })
  @JoinTable()
  events: Relation<EventV2Entity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
