import { http } from "@liexp/shared/lib/io/index.js";
import { Column, Entity, JoinColumn, ManyToOne, type Relation } from "typeorm";
import { MediaEntity } from "./Media.entity.js";
import { ProjectEntity } from "./Project.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

@Entity("project_image")
export class ProjectImageEntity extends DeletableEntity {
  @Column({
    type: "enum",
    enum: http.ProjectImage.Kind.members.map((t) => t.literals[0]),
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
}
