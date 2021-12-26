import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DeathEventEntity } from "./DeathEvent.entity";
import { GroupMemberEntity } from "./GroupMember.entity";
import { ScientificStudyEntity } from "./ScientificStudy.entity";
import { EventEntity } from "@entities/Event.entity";

@Entity("actor")
export class ActorEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  fullName: string;

  @Column({ type: "varchar", unique: true })
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

  @ManyToMany(() => EventEntity, (e) => e.actors, { cascade: false })
  events: EventEntity[];

  @OneToOne(() => DeathEventEntity, (d) => d.victim)
  death: DeathEventEntity;

  @ManyToMany(() => ScientificStudyEntity, (e) => e.authors, {
    cascade: false,
  })
  scientificStudies: ScientificStudyEntity[];

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, unknown> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
