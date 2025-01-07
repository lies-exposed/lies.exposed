import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type BNEditorDocument } from "@liexp/shared/lib/providers/blocknote/type.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity.js";
import { GroupMemberEntity } from "./GroupMember.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { StoryEntity } from "./Story.entity.js";

export const ACTOR_ENTITY_NAME = "actor";

@Entity(ACTOR_ENTITY_NAME)
export class ActorEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: UUID;

  @Column({ type: "varchar" })
  fullName: string;

  @Column({ type: "varchar", unique: true })
  @Index()
  username: string;

  @Column({ type: "varchar", nullable: true })
  old_avatar: string | null;

  @OneToOne(() => MediaEntity, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  avatar: Relation<MediaEntity> | null;

  @Column({ type: "varchar", nullable: false })
  color: string;

  @Column({ type: "date", nullable: true })
  bornOn: string | null;

  @Column({ type: "date", nullable: true })
  diedOn: string | null;

  @OneToMany(() => GroupMemberEntity, (member) => member.actor, {
    cascade: ["insert", "soft-remove", "remove"],
    nullable: true,
  })
  memberIn: Relation<GroupMemberEntity[]>;

  @ManyToMany(() => EventV2Entity, (e) => e.actors, {
    cascade: false,
    onDelete: "NO ACTION",
  })
  events: Relation<EventV2Entity[]>;

  @Column({ type: "json", nullable: true })
  excerpt: BNEditorDocument | null;

  @Column({ type: "json", nullable: true })
  body: any[] | null;

  @ManyToMany(() => StoryEntity, (k) => k.actors, {
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

  eventCount: number;
}
