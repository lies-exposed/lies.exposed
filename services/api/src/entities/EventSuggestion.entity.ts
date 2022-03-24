import * as http from "@liexp/shared/io/http";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("event_suggestion")
export class EventSuggestionEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "json", nullable: true })
  payload: http.Events.EventSuggestion;

  @Column({
    type: "enum",
    enum: http.Events.EventSuggestionStatus.types.map((t) => t.value),
  })
  status: http.Events.EventSuggestionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
