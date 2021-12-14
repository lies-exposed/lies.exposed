import * as http from "@econnessione/shared/io/http";
import { UncategorizedType } from "@econnessione/shared/io/http/Events/Uncategorized";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { KeywordEntity } from "./Keyword.entity";
import { MediaEntity } from "./Media.entity";

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

  @ManyToMany(() => MediaEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  media: MediaEntity[];

  @ManyToMany(() => KeywordEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  keywords: KeywordEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
