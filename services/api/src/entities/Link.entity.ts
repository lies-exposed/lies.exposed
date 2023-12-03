import { type URL, type UUID } from "@liexp/shared/lib/io/http/Common";
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
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity";
import { KeywordEntity } from "./Keyword.entity";
import { MediaEntity } from "./Media.entity";
import { type SocialPostEntity } from "./SocialPost.entity";
import { UserEntity } from "./User.entity";

@Entity("link")
@Index(["url"], { unique: true })
export class LinkEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar", nullable: false, unique: true })
  url: URL;

  @Column({ type: "varchar", nullable: true })
  title: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @ManyToOne(() => MediaEntity, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinColumn()
  image: MediaEntity | null;

  @Column({ type: "timestamptz", nullable: true })
  publishDate: Date | null;

  @Column({ type: "varchar", nullable: true })
  provider: UUID | null;

  @ManyToOne(() => UserEntity, (u) => u.links, {
    nullable: true,
    cascade: false,
  })
  creator: UserEntity | null;

  @ManyToMany(() => EventV2Entity, (e) => e.links, {
    cascade: false,
  })
  events: EventV2Entity[];

  @ManyToMany(() => KeywordEntity, (e) => e.links, {
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
