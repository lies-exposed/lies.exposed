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

@Entity("event_suggestion")
export class EventSuggestionEntity {
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
