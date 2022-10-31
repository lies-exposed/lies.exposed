import * as http from "@liexp/shared/io/http";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { UserEntity } from './User.entity';

@Entity("event_suggestion")
export class EventSuggestionEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "json", nullable: true })
  payload: http.EventSuggestion.EventSuggestion;

  @Column({
    type: "enum",
    enum: http.EventSuggestion.EventSuggestionStatus.types.map((t) => t.value),
  })
  status: http.EventSuggestion.EventSuggestionStatus;

  @ManyToOne(() => UserEntity, u => u.eventSuggestions, {
    cascade: false,
    nullable: true
  })
  createdBy: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
