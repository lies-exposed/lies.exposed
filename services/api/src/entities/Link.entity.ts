import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DeathEventEntity } from "./DeathEvent.entity";
import { EventEntity } from "./Event.entity";

@Entity("link")
@Index(["url"], { unique: true })
export class LinkEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  url: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @ManyToMany(() => EventEntity, (e) => e.links, { cascade: false })
  event: EventEntity;

  @ManyToMany(() => DeathEventEntity, (e) => e.news, { cascade: false })
  death: DeathEventEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
