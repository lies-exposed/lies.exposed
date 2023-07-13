import { SocialPostStatus } from "@liexp/shared/lib/io/http/SocialPost";
import { type UUID } from "io-ts-types/lib/UUID";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("social_post")
export class SocialPostEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "uuid" })
  entity: UUID;

  @Column({ type: "varchar" })
  type: string;

  @Column({ type: "json", nullable: false })
  content: any;

  @Column({
    type: "simple-enum",
    enum: SocialPostStatus.types.map((t) => t.value),
  })
  status: SocialPostStatus;

  @Column({ type: "json", nullable: true })
  result: any;

  @Column({ type: "timestamptz" })
  scheduledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
