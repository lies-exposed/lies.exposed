import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventEntity } from "./event.entity";

@Entity("event_link")
@Index(["event", "url"], { unique: true })
export class EventLinkEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  url: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @ManyToOne(() => EventEntity, (e) => e.id)
  event: EventEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
