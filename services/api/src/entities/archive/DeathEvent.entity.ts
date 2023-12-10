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
import { GroupMemberEntity } from "../GroupMember.entity.js";
import { LinkEntity } from "../Link.entity.js";
import { MediaV1Entity } from "./Media.v1.entity.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";

@Entity("death_event")
export class DeathEventEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "timestamptz", nullable: false })
  date: Date;

  @Column({ type: "json", nullable: true })
  location: { type: "Point"; coordinates: [number, number] } | null;

  @OneToMany(() => LinkEntity, (a) => [], {
    cascade: ["insert"],
    nullable: true,
  })
  news: LinkEntity[];

  @ManyToMany(() => MediaV1Entity, (a) => a.events, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  media: MediaV1Entity[];

  @OneToOne(() => ActorEntity, (v) => v.id, { nullable: false })
  @JoinColumn()
  victim: Relation< ActorEntity>;

  @ManyToMany(() => GroupEntity, (a) => a.id, { nullable: true })
  @JoinTable()
  subspectedGroups: Relation<GroupEntity[]>;

  @ManyToMany(() => ActorEntity, (a) => a.id, { nullable: true })
  @JoinTable()
  supsectedActors: Relation<ActorEntity[]>;

  @ManyToMany(() => GroupMemberEntity, (a) => a.id, { nullable: true })
  @JoinTable()
  suspectedGroupsMembers: Relation<GroupMemberEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
