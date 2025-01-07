import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { AreaEntity } from "./Area.entity.js";
import { ProjectImageEntity } from "./ProjectImage.entity.js";

@Entity("project")
export class ProjectEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: false })
  color: string;

  @Column({ type: "timestamptz", nullable: false })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "varchar", nullable: false })
  body: string;

  @OneToMany(() => ProjectImageEntity, (a) => a.project, {
    cascade: ["insert"],
  })
  media: Relation<ProjectImageEntity[]>;

  @ManyToMany(() => AreaEntity, { cascade: ["insert"] })
  @JoinTable()
  areas: Relation<AreaEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
