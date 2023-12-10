import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";

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
  excerpt: string | null;

  @Column({ type: "json", nullable: true })
  body2: Record<string, unknown> | null;

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

  @DeleteDateColumn()
  deletedAt: Date | null;
}
