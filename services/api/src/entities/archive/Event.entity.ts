import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { ActorEntity } from "../Actor.entity.js";
import { GroupEntity } from "../Group.entity.js";
import { GroupMemberEntity } from "../GroupMember.entity.js";
import { KeywordEntity } from "../Keyword.entity.js";
import { LinkEntity } from "../Link.entity.js";
import { MediaV1Entity } from "./Media.v1.entity.js";

@Entity("event")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "varchar", nullable: false })
  title: string;

  @Column({ type: "timestamptz", nullable: false })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "json", nullable: true })
  location: { type: "Point"; coordinates: [number, number] };

  @Column({ type: "varchar", nullable: true })
  excerpt: string | null;

  @Column({ type: "varchar" })
  body: string;

  @Column({ type: "json", nullable: true })
  body2: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => GroupEntity, (a) => [], { nullable: true })
  @JoinTable()
  groups: Relation<GroupEntity[]>;

  @ManyToMany(() => ActorEntity, (a) => a.events, { nullable: true })
  @JoinTable()
  actors: Relation<ActorEntity[]>;

  @ManyToMany(() => GroupMemberEntity, (gm) => gm.events, { nullable: true })
  @JoinTable()
  groupsMembers: Relation<GroupMemberEntity[]>;

  @ManyToMany(() => LinkEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  links: Relation<LinkEntity[]>;

  @ManyToMany(() => MediaV1Entity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  media: Relation<MediaV1Entity[]>;

  @ManyToMany(() => KeywordEntity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  keywords: Relation<KeywordEntity[]>;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
