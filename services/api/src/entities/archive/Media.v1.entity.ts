import { MediaType } from "@liexp/shared/lib/io/http/Media";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EventEntity } from "./Event.entity";

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
    enum: MediaType.types.map((t) => t.value),
    default: MediaType.types[0].value,
  })
  type: MediaType;

  @ManyToMany(() => EventEntity, (e) => e.media, { cascade: false })
  events: EventEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
