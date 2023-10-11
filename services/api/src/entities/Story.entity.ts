import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ActorEntity } from "./Actor.entity";
import { EventV2Entity } from "./Event.v2.entity";
import { GroupEntity } from "./Group.entity";
import { KeywordEntity } from "./Keyword.entity";
import { MediaEntity } from "./Media.entity";
import { UserEntity } from "./User.entity";

@Entity("story")
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
  featuredImage: MediaEntity | null;

  @Column({ type: "varchar", nullable: true })
  excerpt: string | null;

  @Column({ type: "varchar" })
  body: string;

  @Column({ type: "json", nullable: true })
  body2: Record<string, unknown> | null;

  @ManyToOne(() => UserEntity, (u) => u.stories, {
    cascade: false,
    nullable: true,
  })
  creator: UserEntity | null;

  @ManyToMany(() => KeywordEntity, (k) => k.stories, {
    cascade: false,
  })
  keywords: KeywordEntity[];

  @ManyToMany(() => ActorEntity, (k) => k.stories, {
    cascade: false,
  })
  actors: ActorEntity[];

  @ManyToMany(() => GroupEntity, (k) => k.stories, {
    cascade: false,
  })
  groups: GroupEntity[];

  @ManyToMany(() => MediaEntity, (k) => k.stories, {
    cascade: false,
  })
  @JoinTable()
  media: MediaEntity[];

  @ManyToMany(() => EventV2Entity, (k) => k.stories, {
    cascade: false,
  })
  @JoinTable()
  events: EventV2Entity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
