import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { GroupEntity } from "./Group.entity";
import { ActorEntity } from "@entities/Actor.entity";

@Entity("scientific_study")
export class ScientificStudyEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id: string;

  @Column({ type: "varchar", nullable: false })
  title: string;

  @Column({ type: "timestamptz", nullable: false })
  publishDate: Date;

  @Column({ type: "varchar", nullable: true })
  abstract: string | null;

  @Column({ type: "varchar", nullable: true })
  results: string | null;

  @Column({ type: "varchar", nullable: false })
  conclusion: string;

  @Column({ type: "varchar", nullable: false })
  url: string;

  @ManyToMany(() => ActorEntity, (a) => a.id, { nullable: true })
  @JoinTable()
  authors: ActorEntity[];

  @ManyToOne(() => GroupEntity, (a) => a.id, { nullable: true })
  publisher: GroupEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
