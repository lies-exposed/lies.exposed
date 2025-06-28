import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  type Relation,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { ActorEntity } from "./Actor.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const NATION_ENTITY_NAME = "nation";

@Entity(NATION_ENTITY_NAME)
@Unique(["isoCode"])
export class NationEntity extends DeletableEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", nullable: false })
  isoCode: string;

  @Column({ type: "varchar", nullable: true })
  description: string | null;

  @ManyToMany(() => ActorEntity, (a) => a.nationalities)
  actors: Relation<ActorEntity[]> | UUID[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
