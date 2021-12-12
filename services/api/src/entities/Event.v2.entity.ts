import * as http from "@econnessione/shared/io/http";
import { UncategorizedType } from "@econnessione/shared/io/http/Events/Uncategorized";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("event_v2")
export class EventV2Entity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "timestamptz", nullable: false })
  date: Date;

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({
    type: "enum",
    enum: http.Events.EventV2.types.map(
      (eventC) => eventC.type.props.type.value
    ),
    default: UncategorizedType.value,
  })
  type: http.Events.EventV2["type"];

  @Column({ type: "json", nullable: true })
  payload: http.Events.EventV2["payload"];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
