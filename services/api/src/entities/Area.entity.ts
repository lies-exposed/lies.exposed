import {
  type UUID,
  type Geometry,
} from "@liexp/shared/lib/io/http/Common/index.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { MediaEntity } from "./Media.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";

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
  body: Record<string, any> | null;

  @ManyToMany(() => MediaEntity, (m) => m.areas)
  @JoinTable()
  media: Relation<MediaEntity[]>;

  // admin props
  socialPosts?: SocialPostEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
