import * as io from "@econnessione/shared/io";
import { EventEntity } from "@entities/Event.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GroupMemberEntity } from "./GroupMember.entity";

@Entity("group")
export class GroupEntity {
  type: "GroupFrontmatter";

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

  @OneToMany(() => GroupMemberEntity, (member) => member.group)
  members: GroupMemberEntity[];

  @ManyToMany(() => EventEntity, (a) => a.groups, { nullable: true })
  events: EventEntity[];

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
