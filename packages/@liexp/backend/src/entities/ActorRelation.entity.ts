import { ActorRelationType } from "@liexp/io/lib/http/ActorRelation.js";
import { type BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { Column, Entity, ManyToOne, type Relation, Unique } from "typeorm";
import { ActorEntity } from "./Actor.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const ACTOR_RELATION_ENTITY_NAME = "actor_relation";
@Entity(ACTOR_RELATION_ENTITY_NAME)
@Unique("UQ_actor_relation_actor_type_relatedActor", [
  "actor",
  "type",
  "relatedActor",
])
export class ActorRelationEntity extends DeletableEntity {
  @Column({
    type: "enum",
    enum: ActorRelationType.members.map((l) => l.literals[0]),
  })
  type: ActorRelationType;

  @Column({ type: "timestamptz", nullable: true })
  startDate: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "json", nullable: true })
  excerpt: BlockNoteDocument | null;

  @ManyToOne(() => ActorEntity, (a) => a.id, {
    nullable: false,
    cascade: false,
  })
  actor: Relation<ActorEntity>;

  @ManyToOne(() => ActorEntity, (a) => a.id, {
    nullable: false,
    cascade: false,
  })
  relatedActor: Relation<ActorEntity>;
}
