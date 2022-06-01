import { Polygon } from "@liexp/shared/io/http/Common";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany, PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { MediaEntity } from './Media.entity';

@Entity("area")
export class AreaEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  label: string;

  @Column({ type: "json", nullable: false })
  geometry: Polygon;

  @Column({ type: "json", nullable: true })
  body: unknown | null;

  @ManyToMany(() => MediaEntity, m => m.areas)
  @JoinTable()
  media: MediaEntity[]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
