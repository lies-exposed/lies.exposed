import { http } from "@liexp/shared/io";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MediaEntity } from "./Media.entity";
import { ProjectEntity } from "./Project.entity";

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
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  image: MediaEntity;

  @ManyToOne(() => ProjectEntity, (a) => a.id, { nullable: false })
  @JoinColumn()
  project: ProjectEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
