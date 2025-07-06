import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  type Relation,
} from "typeorm";
import { AreaEntity } from "./Area.entity.js";
import { ProjectImageEntity } from "./ProjectImage.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

@Entity("project")
export class ProjectEntity extends DeletableEntity {
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
}
