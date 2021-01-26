import { ActorEntity } from "@routes/actors/actor.entity";
import { GroupEntity } from "@routes/groups/group.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventImageEntity } from "./EventImage.entity";
import { EventLinkEntity } from "./EventLink.entity";

@Entity("event")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  title: string;

  @Column({ type: "timestamptz", nullable: false })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @OneToMany(() => EventLinkEntity, (e) => e.event)
  links: EventLinkEntity[];

  @OneToMany(() => EventImageEntity, (e) => e.event)
  images: EventImageEntity[];

  @ManyToMany(() => GroupEntity, (a) => a.events)
  @JoinTable()
  groups: GroupEntity[];

  @ManyToMany(() => ActorEntity, (a) => a.events)
  @JoinTable()
  actors: ActorEntity[];

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
