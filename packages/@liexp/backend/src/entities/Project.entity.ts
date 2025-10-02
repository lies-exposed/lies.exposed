import { Column, Entity, JoinTable, ManyToMany, type Relation } from "typeorm";
import { AreaEntity } from "./Area.entity.js";
import { MediaEntity } from "./Media.entity.js";
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

  @ManyToMany(() => MediaEntity, (a) => a.projects, {
    cascade: ["insert"],
    nullable: true,
  })
  @JoinTable()
  media: Relation<MediaEntity[] | string[]>;

  @ManyToMany(() => AreaEntity, { cascade: ["insert"] })
  @JoinTable()
  areas: Relation<AreaEntity[]>;
}
