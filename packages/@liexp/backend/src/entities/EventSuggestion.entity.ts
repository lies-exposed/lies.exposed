import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as EventSuggestion from "@liexp/io/lib/http/EventSuggestion.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./User.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const EVENT_SUGGESTION_ENTITY_NAME = "event_suggestion";

@Entity(EVENT_SUGGESTION_ENTITY_NAME)
export class EventSuggestionEntity extends DeletableEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: UUID;

  @Column({ type: "json", nullable: true })
  payload: EventSuggestion.CreateEventSuggestion;

  @Column({
    type: "enum",
    enum: EventSuggestion.EventSuggestionStatus.members.map(
      (t) => t.literals[0],
    ),
  })
  status: EventSuggestion.EventSuggestionStatus;

  @ManyToOne(() => UserEntity, (u) => u.eventSuggestions, {
    cascade: false,
  })
  creator: Relation<UserEntity>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
