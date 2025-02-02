import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
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
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { type ActorEntity } from "./Actor.entity.js";
import { AreaEntity } from "./Area.entity.js";
import { type GroupEntity } from "./Group.entity.js";
import { KeywordEntity } from "./Keyword.entity.js";
import { LinkEntity } from "./Link.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";
import { StoryEntity } from "./Story.entity.js";

export const EVENT_ENTITY_NAME = "event_v2";

@Entity(EVENT_ENTITY_NAME)
export class EventV2Entity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: UUID;

  @Column({ type: "bool", default: true })
  draft: boolean;

  @Column({ type: "timestamptz", nullable: false })
  date: Date;

  @Column({ type: "json", nullable: true })
  excerpt: BlockNoteDocument | null;

  @Column({ type: "json", nullable: true })
  body: BlockNoteDocument | null;

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
