import * as http from "@liexp/shared/io/http";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("event_suggestion")
export class EventSuggestionEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "json", nullable: true })
  payload: http.Events.EventSuggestion;

  @Column({ type: 'enum', enum: ['PENDING', 'COMPLETED', 'DISCARDED']})
  status: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
