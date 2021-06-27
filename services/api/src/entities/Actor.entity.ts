import { EventEntity } from "@entities/Event.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DeathEventEntity } from "./DeathEvent.entity";
import { GroupMemberEntity } from "./GroupMember.entity";

@Entity("actor")
export class ActorEntity {
  type: "ActorFrontmatter";

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

  @OneToMany(() => GroupMemberEntity, (member) => member.actor)
  memberIn: GroupMemberEntity[];

  @ManyToMany(() => EventEntity, (e) => e.actors)
  events: EventEntity[];

  @OneToOne(() => DeathEventEntity, (d) => d.victim)
  death: DeathEventEntity;

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
