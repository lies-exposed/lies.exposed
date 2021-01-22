import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventImageEntity } from "./EventImage.entity";
import { EventLinkEntity } from "./EventLink.entity";

@Entity("events")
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

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
