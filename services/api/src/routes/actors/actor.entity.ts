import { EventEntity } from "@routes/events/event.entity";
import { GroupEntity } from "@routes/groups/group.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("actor")
export class ActorEntity {
  type: "ActorFrontmatter";

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  fullName: string;

  @Column({ type: "varchar" })
  username: string;

  @Column({ type: "varchar", nullable: true })
  avatar: string | null;

  @Column({ type: "varchar", nullable: false })
  color: string;

  @ManyToMany(() => GroupEntity, (g) => g.members)
  @JoinTable()
  groups: GroupEntity[];

  @ManyToMany(() => EventEntity, (e) => e.actors)
  events: EventEntity[];

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
