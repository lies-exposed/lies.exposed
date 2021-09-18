import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GroupMemberEntity } from "./GroupMember.entity";
import { ImageEntity } from "./Image.entity";
import { LinkEntity } from "./Link.entity";
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

  @ManyToMany(() => LinkEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  links: LinkEntity[];

  @ManyToMany(() => ImageEntity, (a) => a.events, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  images: ImageEntity[];

  @ManyToMany(() => GroupEntity, (a) => a.events, { nullable: true })
  @JoinTable()
  groups: GroupEntity[];

  @ManyToMany(() => ActorEntity, (a) => a.events, { nullable: true })
  @JoinTable()
  actors: ActorEntity[];

  @ManyToMany(() => GroupMemberEntity, (gm) => gm.events, { nullable: true })
  @JoinTable()
  groupsMembers: GroupMemberEntity[];
}
