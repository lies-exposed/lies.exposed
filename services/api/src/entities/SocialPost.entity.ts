import * as t from "io-ts";
import { type UUID } from "io-ts-types/lib/UUID";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

export const TO_PUBLISH = t.literal("TO_PUBLISH");
export const PUBLISHED = t.literal("PUBLISHED");
export const SocialPostStatus = t.union(
  [TO_PUBLISH, PUBLISHED],
  "SocialPostStatus"
);

export type SocialPostStatus = t.TypeOf<typeof SocialPostStatus>;

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
