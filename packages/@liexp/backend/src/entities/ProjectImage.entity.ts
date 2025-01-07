import { http } from "@liexp/shared/lib/io/index.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { MediaEntity } from "./Media.entity.js";
import { ProjectEntity } from "./Project.entity.js";

@Entity("project_image")
export class ProjectImageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: http.ProjectImage.Kind.types.map((t) => t.value),
  })
  kind: http.ProjectImage.Kind;

  @ManyToOne(() => MediaEntity, (a) => a.id, {
    cascade: ["insert"],
    nullable: false,
  })
  @JoinColumn()
  image: Relation<MediaEntity>;

  @ManyToOne(() => ProjectEntity, (a) => a.id, { nullable: false })
  @JoinColumn()
  project: Relation<ProjectEntity>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
