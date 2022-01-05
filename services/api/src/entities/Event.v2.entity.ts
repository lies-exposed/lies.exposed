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
import { LinkEntity } from "./Link.entity";
import { MediaEntity } from "./Media.entity";

@Entity("event_v2")
export class EventV2Entity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "bool", default: true })
  draft: boolean;

  @Column({ type: "timestamptz", nullable: false })
  date: Date;

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, unknown> | null;

  @Column({
    type: "enum",
    enum: http.Events.Event.types.map((eventC) => eventC.type.props.type.value),
    default: UncategorizedType.value,
  })
  type: http.Events.Event["type"];

  @Column({ type: "json", nullable: true })
  payload: http.Events.Event["payload"];

  @ManyToMany(() => LinkEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  links: LinkEntity[];

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
