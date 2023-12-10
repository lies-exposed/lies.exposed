import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { GroupMemberEntity } from "./GroupMember.entity.js";
import { StoryEntity } from "./Story.entity.js";

@Entity("group")
export class GroupEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: true })
  username: string | null;

  @Column({ type: "varchar", length: 6 })
  color: string;

  @Column({ type: "varchar", nullable: true })
  avatar: string | null;

  @Column({
    enum: io.http.Group.GroupKind.types.map((t) => t.value),
    type: "enum",
  })
  kind: io.http.Group.GroupKind;

  @Column({ type: "timestamp", nullable: true })
  startDate: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endDate: Date | null;

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, unknown> | null;

  @OneToMany(() => GroupMemberEntity, (member) => member.group, {
    cascade: ["insert"],
    nullable: true,
  })
  members: Relation< GroupMemberEntity[]>;

  @ManyToMany(() => StoryEntity, (k) => k.groups, {
    cascade: false,
  })
  @JoinTable()
  stories: Relation< StoryEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
