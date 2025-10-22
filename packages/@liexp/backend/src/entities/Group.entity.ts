import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { type Color } from "@liexp/shared/lib/io/http/Common/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  type Relation,
} from "typeorm";
import { GroupMemberEntity } from "./GroupMember.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { StoryEntity } from "./Story.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const GROUP_ENTITY_NAME = "group";

@Entity(GROUP_ENTITY_NAME)
export class GroupEntity extends DeletableEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: true })
  username: string | null;

  @Column({ type: "varchar", length: 6 })
  color: Color;

  @OneToOne(() => MediaEntity, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  avatar: Relation<MediaEntity> | null;

  @Column({
    enum: io.http.Group.GroupKind.members.map((t) => t.literals[0]),
    type: "enum",
  })
  kind: io.http.Group.GroupKind;

  @Column({ type: "timestamp", nullable: true })
  startDate: Date | null;

  @Column({ type: "timestamp", nullable: true })
  endDate: Date | null;

  @Column({ type: "json", nullable: true })
  excerpt: BlockNoteDocument | null;

  @Column({ type: "json", nullable: true })
  body: BlockNoteDocument | null;

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
}
