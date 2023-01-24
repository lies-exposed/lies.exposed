import * as http from "@liexp/shared/io/http";
import { UNCATEGORIZED } from "@liexp/shared/io/http/Events/Uncategorized";
import { type UUID } from 'io-ts-types/lib/UUID';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { type ActorEntity } from './Actor.entity';
import { type GroupEntity } from './Group.entity';
import { KeywordEntity } from "./Keyword.entity";
import { LinkEntity } from "./Link.entity";
import { MediaEntity } from "./Media.entity";

@Entity("event_v2")
export class EventV2Entity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: UUID;

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
    default: UNCATEGORIZED.value,
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

  actors: ActorEntity[];
  groups: GroupEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
