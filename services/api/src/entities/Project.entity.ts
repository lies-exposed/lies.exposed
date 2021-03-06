import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { AreaEntity } from "./Area.entity";
import { ProjectImageEntity } from "./ProjectImage.entity";

@Entity("project")
export class ProjectEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  color: string;

  @Column({ type: "timestamptz", nullable: false })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "varchar" })
  body: string;

  @OneToMany(() => ProjectImageEntity, a => a.project, { cascade: true })
  images: ProjectImageEntity[];

  @ManyToMany(() => AreaEntity, { cascade: true })
  @JoinTable()
  areas: AreaEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
