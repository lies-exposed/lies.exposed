import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { MediaType, type MediaExtra } from "@liexp/shared/lib/io/http/Media.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { AreaEntity } from "./Area.entity.js";
import { EventV2Entity } from "./Event.v2.entity.js";
import { KeywordEntity } from "./Keyword.entity.js";
import { LinkEntity } from "./Link.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";
import { StoryEntity } from "./Story.entity.js";
import { UserEntity } from "./User.entity.js";

@Entity("image")
export class MediaEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar", nullable: true })
  label: string | null;

  @Column({ type: "varchar", nullable: true })
  thumbnail: string | null;

  @Column({ type: "varchar", nullable: false, unique: true })
  location: string;

  @Column({ type: "varchar", nullable: true })
  description: string | null;

  @Column({
    type: "enum",
    enum: MediaType.types.map((t) => t.value),
    default: MediaType.types[0].value,
  })
  type: MediaType;

  @ManyToOne(() => UserEntity, (u) => u.media, {
    cascade: false,
    nullable: true,
  })
  @JoinTable()
  creator: Relation< UserEntity | null>;

  @Column({
    type: "json",
    nullable: true,
  })
  extra: Relation< MediaExtra | null>;

  @ManyToMany(() => EventV2Entity, (e) => e.media, {
    cascade: false,
  })
  events: Relation< EventV2Entity[]>;

  @OneToMany(() => LinkEntity, (e) => e.image, {
    cascade: false,
  })
  links: Relation< LinkEntity[]>;

  @ManyToMany(() => AreaEntity, (a) => a.media, {
    cascade: false,
  })
  areas: Relation< AreaEntity[]>;

  @OneToMany(() => StoryEntity, (a) => a.featuredImage, {
    cascade: false,
  })
  featuredIn:Relation< StoryEntity[]>;

  @ManyToMany(() => StoryEntity, (a) => a.media, {
    cascade: false,
  })
  stories: Relation< StoryEntity[]>;

  @ManyToMany(() => KeywordEntity, (a) => a.media, {
    cascade: false,
  })
  keywords: Relation< KeywordEntity[]>;

  socialPosts?: SocialPostEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
