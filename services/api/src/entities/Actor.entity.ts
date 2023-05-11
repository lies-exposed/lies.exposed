import { type UUID } from "io-ts-types/lib/UUID";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ActorFamily } from "./ActorUnion.entity";
import { EventV2Entity } from "./Event.v2.entity";
import { GroupMemberEntity } from "./GroupMember.entity";
import { StoryEntity } from "./Story.entity";

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

  @Column({ type: "date", nullable: true })
  bornDate: Date;

  @Column({ type: "date", nullable: true })
  deathDate: Date | null;

  @Column({ type: "varchar", nullable: false })
  color: string;

  @Column({ type: "date", nullable: true })
  bornOn: string | null;

  @Column({ type: "date", nullable: true })
  diedOn: string | null;

  @OneToMany(() => GroupMemberEntity, (member) => member.actor, {
    cascade: ["insert"],
    nullable: true,
  })
  memberIn: GroupMemberEntity[];

  @ManyToMany(() => EventV2Entity, (e) => e.actors, {
    cascade: false,
    onDelete: "NO ACTION",
  })
  events: EventV2Entity[];

  @OneToOne(() => ActorFamily, (a) => a.subject, { nullable: true, cascade: false })
  family: ActorFamily | null;

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, unknown> | null;

  @ManyToMany(() => StoryEntity, (k) => k.actors, {
    cascade: false,
  })
  @JoinTable()
  stories: StoryEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  eventCount: number;
}
