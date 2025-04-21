import { MediaType } from "@liexp/shared/lib/io/http/Media/index.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { EventEntity } from "./Event.entity.js";

@Entity("image")
export class MediaV1Entity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: true })
  thumbnail: string | null;

  @Column({ type: "varchar", nullable: false })
  location: string;

  @Column({ type: "varchar", nullable: false })
  description: string;

  @Column({
    type: "enum",
    enum: MediaType.members.map((t) => t.literals[0]),
    default: MediaType.members[0].literals[0],
  })
  type: MediaType;

  @ManyToMany(() => EventEntity, (e) => e.media, { cascade: false })
  events: Relation<EventEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
