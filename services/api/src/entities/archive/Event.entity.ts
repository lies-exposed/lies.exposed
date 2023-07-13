import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ActorEntity } from "../Actor.entity";
import { GroupEntity } from "../Group.entity";
import { GroupMemberEntity } from "../GroupMember.entity";
import { KeywordEntity } from "../Keyword.entity";
import { LinkEntity } from "../Link.entity";
import { MediaV1Entity } from "./Media.v1.entity";

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
  groups: GroupEntity[];

  @ManyToMany(() => ActorEntity, (a) => a.events, { nullable: true })
  @JoinTable()
  actors: ActorEntity[];

  @ManyToMany(() => GroupMemberEntity, (gm) => gm.events, { nullable: true })
  @JoinTable()
  groupsMembers: GroupMemberEntity[];

  @ManyToMany(() => LinkEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  links: LinkEntity[];

  @ManyToMany(() => MediaV1Entity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  media: MediaV1Entity[];

  @ManyToMany(() => KeywordEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  keywords: KeywordEntity[];

  @DeleteDateColumn()
  deletedAt: Date | null;
}
