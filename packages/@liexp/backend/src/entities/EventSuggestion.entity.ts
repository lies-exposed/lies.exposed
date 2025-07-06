import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
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
  payload: http.EventSuggestion.CreateEventSuggestion;

  @Column({
    type: "enum",
    enum: http.EventSuggestion.EventSuggestionStatus.members.map(
      (t) => t.literals[0],
    ),
  })
  status: http.EventSuggestion.EventSuggestionStatus;

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
