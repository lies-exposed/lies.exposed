import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AreaEntity } from "./Area.entity";
import { ImageEntity } from "./Image.entity";

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

  @ManyToMany(() => ImageEntity, { cascade: true })
  @JoinTable()
  images: ImageEntity[];

  @ManyToMany(() => AreaEntity, { cascade: true })
  @JoinTable()
  areas: AreaEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
