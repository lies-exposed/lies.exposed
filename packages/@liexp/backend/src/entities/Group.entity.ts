import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { type BNEditorDocument } from "@liexp/shared/lib/providers/blocknote/type.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { GroupMemberEntity } from "./GroupMember.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { StoryEntity } from "./Story.entity.js";

export const GROUP_ENTITY_NAME = "group";

@Entity(GROUP_ENTITY_NAME)
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
  old_avatar: string | null;

  @OneToOne(() => MediaEntity, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  avatar: Relation<MediaEntity> | null;

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
  excerpt: BNEditorDocument | null;

  @Column({ type: "json", nullable: true })
  body: any[] | null;

  @OneToMany(() => GroupMemberEntity, (member) => member.group, {
    cascade: ["insert", "soft-remove", "remove"],
    nullable: true,
  })
  members: Relation<GroupMemberEntity[]>;

  @ManyToMany(() => StoryEntity, (k) => k.groups, {
    cascade: false,
  })
  @JoinTable()
  stories: Relation<StoryEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
