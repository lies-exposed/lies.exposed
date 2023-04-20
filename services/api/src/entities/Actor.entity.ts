import { type UUID } from 'io-ts-types/lib/UUID';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity";
import { GroupMemberEntity } from "./GroupMember.entity";

@Entity("actor")
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
  avatar: string | null;

  @Column({ type: "varchar", nullable: false })
  color: string;

  @OneToMany(() => GroupMemberEntity, (member) => member.actor, {
    nullable: true,
    cascade: true,
  })
  memberIn: GroupMemberEntity[];

  @ManyToMany(() => EventV2Entity, e => e.actors, { cascade: false })
  events: EventV2Entity[];

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  bodyV2: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  eventCount: number;
}
