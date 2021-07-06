import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
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

  @ManyToOne(() => EventEntity, (e) => e.links)
  event: EventEntity;

  @ManyToOne(() => DeathEventEntity, (e) => e.news)
  death: DeathEventEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
