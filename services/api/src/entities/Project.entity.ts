import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AreaEntity } from "./Area.entity";
import { ProjectImageEntity } from "./ProjectImage.entity";

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

  @OneToMany(() => ProjectImageEntity, (a) => a.project, { cascade: true })
  media: ProjectImageEntity[];

  @ManyToMany(() => AreaEntity, { cascade: true })
  @JoinTable()
  areas: AreaEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
