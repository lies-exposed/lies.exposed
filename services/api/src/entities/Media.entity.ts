import { MediaType, type MediaExtra } from "@liexp/shared/lib/io/http/Media";
import { type UUID } from "io-ts-types/lib/UUID";
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
  UpdateDateColumn,
} from "typeorm";
import { AreaEntity } from "./Area.entity";
import { EventV2Entity } from "./Event.v2.entity";
import { KeywordEntity } from "./Keyword.entity";
import { LinkEntity } from "./Link.entity";
import { type SocialPostEntity } from "./SocialPost.entity";
import { StoryEntity } from "./Story.entity";
import { UserEntity } from "./User.entity";

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
  creator: UserEntity | null;

  @Column({
    type: "json",
    nullable: true,
  })
  extra: MediaExtra | null;

  @ManyToMany(() => EventV2Entity, (e) => e.media, {
    cascade: false,
  })
  events: EventV2Entity[];

  @OneToMany(() => LinkEntity, (e) => e.image, {
    cascade: false,
  })
  links: LinkEntity[];

  @ManyToMany(() => AreaEntity, (a) => a.media, {
    cascade: false,
  })
  areas: AreaEntity[];

  @OneToMany(() => StoryEntity, (a) => a.featuredImage, {
    cascade: false,
  })
  featuredIn: StoryEntity[];

  @ManyToMany(() => StoryEntity, (a) => a.media, {
    cascade: false,
  })
  stories: StoryEntity[];

  @ManyToMany(() => KeywordEntity, (a) => a.media, {
    cascade: false,
  })
  keywords: KeywordEntity[];

  socialPosts?: SocialPostEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
