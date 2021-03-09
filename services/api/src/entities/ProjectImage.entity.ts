import { http } from "@econnessione/shared/io";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ImageEntity } from "./Image.entity";
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

  @ManyToOne(() => ImageEntity, (a) => a.id, {
    eager: true,
    cascade: true,
    nullable: false,
  })
  @JoinColumn()
  image: ImageEntity;

  @ManyToOne(() => ProjectEntity, (a) => a.id, { nullable: false })
  @JoinColumn()
  project: ProjectEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
