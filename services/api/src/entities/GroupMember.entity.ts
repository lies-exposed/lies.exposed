import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventEntity } from "./Event.entity";

@Entity("group_member")
export class GroupMemberEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamptz", nullable: true })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => GroupEntity, (g) => g.id)
  @JoinColumn()
  group: GroupEntity;

  @ManyToOne(() => ActorEntity, (a) => a.id)
  @JoinColumn()
  actor: ActorEntity;

  @ManyToMany(() => EventEntity, (e) => e.groupMembers)
  events: EventEntity[];
}
