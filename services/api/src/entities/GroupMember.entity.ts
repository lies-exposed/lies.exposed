import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToMany, ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";

@Entity("group_member")
export class GroupMemberEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamptz", nullable: true, default: 'now()' })
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
  group: GroupEntity;

  @ManyToOne(() => ActorEntity, (a) => a.id, {
    nullable: false,
    cascade: false,
  })
  actor: ActorEntity;

  @ManyToMany(() => EventV2Entity, { cascade: false })
  events: EventV2Entity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
