import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import {
  type Color,
  type UUID,
} from "@liexp/shared/lib/io/http/Common/index.js";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  type Relation,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity.js";
import { GroupMemberEntity } from "./GroupMember.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { StoryEntity } from "./Story.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const ACTOR_ENTITY_NAME = "actor";

@Entity(ACTOR_ENTITY_NAME)
export class ActorEntity extends DeletableEntity {
  @Column({ type: "varchar" })
  fullName: string;

  @Column({ type: "varchar", unique: true })
  @Index()
  username: string;

  @Column({ type: "varchar", nullable: true })
  old_avatar: string | null;

  @OneToOne(() => MediaEntity, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  avatar: Relation<MediaEntity> | UUID | null;

  @Column({ type: "varchar", nullable: false })
  color: Color;

  @Column({ type: "date", nullable: true })
  bornOn: Date | null;

  @Column({ type: "date", nullable: true })
  diedOn: Date | null;

  @OneToMany(() => GroupMemberEntity, (member) => member.actor, {
    cascade: ["insert", "soft-remove", "remove"],
    nullable: true,
  })
  memberIn: Relation<GroupMemberEntity[]>;

  @ManyToMany(() => EventV2Entity, (e) => e.actors, {
    cascade: false,
    onDelete: "NO ACTION",
  })
  events: Relation<EventV2Entity[]>;

  @Column({ type: "json", nullable: true })
  excerpt: BlockNoteDocument | null;

  @Column({ type: "json", nullable: true })
  body: BlockNoteDocument | null;

  @ManyToMany(() => StoryEntity, (k) => k.actors, {
    cascade: false,
  })
  @JoinTable()
  stories: Relation<StoryEntity[]>;

  // TODO: add relation to death event
  death: UUID | null;

  eventCount: number;
}
