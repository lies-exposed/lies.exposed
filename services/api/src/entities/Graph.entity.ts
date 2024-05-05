import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type GraphType } from "@liexp/shared/lib/io/http/graphs/Graph.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./User.entity.js";

@Entity("graph")
@Index(["slug"])
export class GraphEntity {
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

  @Column({ type: "text", default: false })
  graphType: GraphType;

  @Column({ type: "json", nullable: false })
  data: any;

  @Column({ type: "json", nullable: false })
  options: any;

  @Column({ type: "json", nullable: true })
  excerpt: Record<string, any> | null;

  @Column({ type: "json", nullable: true })
  body: Record<string, any> | null;

  @ManyToOne(() => UserEntity, (u) => u.links, {
    nullable: true,
    cascade: false,
  })
  creator: Relation<UserEntity | null>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
