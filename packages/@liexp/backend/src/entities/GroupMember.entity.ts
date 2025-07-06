import { BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { Column, Entity, ManyToMany, ManyToOne, type Relation } from "typeorm";
import { ActorEntity } from "./Actor.entity.js";
import { EventV2Entity } from "./Event.v2.entity.js";
import { GroupEntity } from "./Group.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const GROUP_MEMBER_ENTITY_NAME = "group_member";
@Entity(GROUP_MEMBER_ENTITY_NAME)
export class GroupMemberEntity extends DeletableEntity {
  @Column({ type: "timestamptz", nullable: true })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "json", nullable: true })
  excerpt: BlockNoteDocument | null;

  @Column({ type: "json", nullable: true })
  body: BlockNoteDocument | null;

  @ManyToOne(() => GroupEntity, (g) => g.id, {
    nullable: false,
    cascade: false,
  })
  group: Relation<GroupEntity>;

  @ManyToOne(() => ActorEntity, (a) => a.id, {
    nullable: false,
    cascade: false,
  })
  actor: Relation<ActorEntity>;

  @ManyToMany(() => EventV2Entity, { cascade: false })
  events: Relation<EventV2Entity[]>;
}
