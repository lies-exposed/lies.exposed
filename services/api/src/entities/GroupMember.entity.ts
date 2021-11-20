import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventEntity } from "./Event.entity";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";

@Entity("group_member")
export class GroupMemberEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "timestamptz", nullable: true })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "varchar", nullable: true })
  excerpt: string | null;

  @Column({ type: "varchar", nullable: false })
  body: string;

  @Column({ type: "json", nullable: true })
  body2: Record<string, unknown> | null;

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

  @ManyToMany(() => EventEntity, (e) => e.groupsMembers, { cascade: false })
  events: EventEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
