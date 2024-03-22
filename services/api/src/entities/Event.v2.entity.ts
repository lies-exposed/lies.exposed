import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { UNCATEGORIZED } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
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
  ManyToOne,
} from "typeorm";
import { type ActorEntity } from "./Actor.entity.js";
import { AreaEntity } from "./Area.entity.js";
import { type GroupEntity } from "./Group.entity.js";
import { KeywordEntity } from "./Keyword.entity.js";
import { LinkEntity } from "./Link.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";
import { StoryEntity } from "./Story.entity.js";

@Entity("event_v2")
export class EventV2Entity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: UUID;

  @Column({ type: "bool", default: true })
  draft: boolean;

  @Column({ type: "timestamptz", nullable: false })
  date: Date;

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, unknown> | null;

  @Column({
    type: "enum",
    enum: http.Events.Event.types.map((eventC) => eventC.type.props.type.value),
    default: UNCATEGORIZED.value,
  })
  type: http.Events.Event["type"];

  @Column({ type: "json", nullable: true })
  payload: http.Events.Event["payload"];

  @ManyToMany(() => LinkEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  links: Relation<LinkEntity[]>;

  @ManyToMany(() => MediaEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  media: Relation<MediaEntity[]>;

  @ManyToMany(() => KeywordEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  keywords: Relation<KeywordEntity[]>;

  @ManyToOne(() => AreaEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  location: Relation<AreaEntity | null>;

  @ManyToMany(() => StoryEntity, (k) => k.events, {
    cascade: false,
    onDelete: "NO ACTION",
  })
  stories: Relation<StoryEntity[]>;

  actors: ActorEntity[];
  groups: GroupEntity[];
  socialPosts?: SocialPostEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
