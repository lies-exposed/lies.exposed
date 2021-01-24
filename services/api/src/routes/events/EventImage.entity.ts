import { EventEntity } from "@routes/events/event.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("event_image")
export class EventImageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  location: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @ManyToOne(() => EventEntity, (e) => e.id)
  event: EventEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
