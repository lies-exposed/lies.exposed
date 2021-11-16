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
import { GroupMemberEntity } from "./GroupMember.entity";
import { KeywordEntity } from "./Keyword.entity";
import { LinkEntity } from "./Link.entity";
import { MediaEntity } from "./Media.entity";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";

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

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => GroupEntity, (a) => a.events, { nullable: true })
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

  @ManyToMany(() => MediaEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  media: MediaEntity[];

  @ManyToMany(() => KeywordEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  keywords: KeywordEntity[];

  @DeleteDateColumn()
  deletedAt: Date | null;
}
