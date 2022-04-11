import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
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
  UpdateDateColumn
} from "typeorm";
import { GroupMemberEntity } from "../GroupMember.entity";
import { LinkEntity } from "../Link.entity";
import { MediaV1Entity } from './Media.v1.entity';

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
    cascade: true,
    nullable: true,
  })
  news: LinkEntity[];

  @ManyToMany(() => MediaV1Entity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  media: MediaV1Entity[];

  @OneToOne(() => ActorEntity, (v) => v.id, { nullable: false })
  @JoinColumn()
  victim: ActorEntity;

  @ManyToMany(() => GroupEntity, (a) => a.id, { nullable: true })
  @JoinTable()
  subspectedGroups: GroupEntity[];

  @ManyToMany(() => ActorEntity, (a) => a.id, { nullable: true })
  @JoinTable()
  supsectedActors: ActorEntity[];

  @ManyToMany(() => GroupMemberEntity, (a) => a.id, { nullable: true })
  @JoinTable()
  suspectedGroupsMembers: GroupMemberEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
