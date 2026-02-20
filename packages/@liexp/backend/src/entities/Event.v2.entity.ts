import { type BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { type UUID } from "@liexp/io/lib/http/Common/index.js";
import {
  type SCIENTIFIC_STUDY,
  UNCATEGORIZED,
} from "@liexp/io/lib/http/Events/EventType.js";
import { type ScientificStudyPayload } from "@liexp/io/lib/http/Events/ScientificStudy.js";
import * as Events from "@liexp/io/lib/http/Events/index.js";
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  type Relation,
} from "typeorm";
import { type ActorEntity } from "./Actor.entity.js";
import { AreaEntity } from "./Area.entity.js";
import { type GroupEntity } from "./Group.entity.js";
import { KeywordEntity } from "./Keyword.entity.js";
import { LinkEntity } from "./Link.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";
import { StoryEntity } from "./Story.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const EVENT_ENTITY_NAME = "event_v2";

@Entity(EVENT_ENTITY_NAME)
export class EventV2Entity extends DeletableEntity {
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
    enum: Events.Event.members.map(
      (eventC) => eventC.fields.type.literals[0],
    ),
    default: UNCATEGORIZED.literals[0],
  })
  type: Events.Event["type"];

  @Column({ type: "json", nullable: true })
  payload: Events.Event["payload"];

  @ManyToMany(() => LinkEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  links: Relation<LinkEntity[] | UUID[]>;

  @ManyToMany(() => MediaEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  media: Relation<MediaEntity[] | UUID[]>;

  @ManyToMany(() => KeywordEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  keywords: Relation<KeywordEntity[] | UUID[]>;

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
  socialPosts?: Relation<SocialPostEntity[]> | UUID[];
}

export class ScientificStudyEntity extends EventV2Entity {
  declare type: SCIENTIFIC_STUDY;
  declare payload: ScientificStudyPayload;
}
