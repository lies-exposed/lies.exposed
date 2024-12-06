import {
  type Geometry,
  type UUID,
} from "@liexp/shared/lib/io/http/Common/index.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { type SocialPostEntity } from "./SocialPost.entity.js";

export const AREA_ENTITY_NAME = "area";

@Entity(AREA_ENTITY_NAME)
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

  @ManyToOne(() => MediaEntity, (v) => v.featuredInAreas, {
    eager: true,
    cascade: false,
    nullable: true,
  })
  featuredImage: Relation<MediaEntity | null>;

  @ManyToMany(() => MediaEntity, (m) => m.areas, {})
  @JoinTable()
  media: Relation<MediaEntity[] | null>;

  @OneToMany(() => EventV2Entity, (a) => a.location)
  events: EventV2Entity[];

  // admin props
  socialPosts?: SocialPostEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
