import { type UUID, type Geometry } from "@liexp/shared/lib/io/http/Common";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MediaEntity } from "./Media.entity";
import { type SocialPostEntity } from "./SocialPost.entity";

@Entity("area")
@Index(["slug"])
export class AreaEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar", nullable: false })
  label: string;

  @Column({
    type: "varchar",
    default: "uuid_generate_v4()",
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({ type: "bool", default: true })
  draft: boolean;

  @Column({ type: "json", nullable: false })
  geometry: Geometry.Geometry;

  @Column({ type: "json", nullable: true })
  body: unknown | null;

  @ManyToMany(() => MediaEntity, (m) => m.areas)
  @JoinTable()
  media: MediaEntity[];

  // admin props
  socialPosts?: SocialPostEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
