import * as io from "@econnessione/shared/io";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GroupMemberEntity } from "./GroupMember.entity";
import { ScientificStudyEntity } from "./ScientificStudy.entity";
import { UncategorizedEventEntity } from "./events/UncategorizedEvent.entity";

@Entity("group")
export class GroupEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", length: 6 })
  color: string;

  @Column({ type: "varchar", nullable: true })
  avatar: string;

  @Column({
    enum: io.http.Group.GroupKind.types.map((t) => t.value),
    type: "enum",
  })
  kind: io.http.Group.GroupKind;

  @OneToMany(() => GroupMemberEntity, (member) => member.group, {
    nullable: true,
    cascade: true,
  })
  members: GroupMemberEntity[];

  @ManyToMany(() => UncategorizedEventEntity, (e) => e.groups, {
    cascade: false,
  })
  events: UncategorizedEventEntity[];

  @OneToMany(() => ScientificStudyEntity, (a) => a.publisher, {
    cascade: false,
  })
  publishedStudies: ScientificStudyEntity[];

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
