import {
  SocialPostStatus,
  type SocialPostPublishResult,
  type SocialPostResourceType,
} from "@liexp/shared/lib/io/http/SocialPost";
import { type UUID } from "io-ts-types/lib/UUID";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { type LinkEntity } from "./Link.entity";

@Entity("social_post")
@Index(["type", "entity"])
export class SocialPostEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "uuid" })
  entity: UUID;

  @Column({ type: "varchar" })
  type: SocialPostResourceType;

  @Column({ type: "json", nullable: false })
  content: any;

  @Column({
    type: "simple-enum",
    enum: SocialPostStatus.types.map((t) => t.value),
  })
  status: SocialPostStatus;

  @Column({ type: "json", nullable: true })
  result: SocialPostPublishResult;

  @Column({ type: "timestamptz" })
  scheduledAt: Date;

  links?: LinkEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
