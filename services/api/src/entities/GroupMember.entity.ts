import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";

@Entity("group_member")
export class GroupMemberEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamptz", nullable: true })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, unknown> | null;

  @ManyToOne(() => GroupEntity, (g) => g.id, {
    nullable: false,
    cascade: false,
  })
  group: Relation<GroupEntity>

  @ManyToOne(() => ActorEntity, (a) => a.id, {
    nullable: false,
    cascade: false,
  })
  actor:Relation< ActorEntity>;

  @ManyToMany(() => EventV2Entity, { cascade: false })
  events: Relation<EventV2Entity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
