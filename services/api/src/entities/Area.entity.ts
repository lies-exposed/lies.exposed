import {
  Column,
  CreateDateColumn,
  Entity,


  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

@Entity("area")
export class AreaEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  label: string;

  @Column({ type: 'varchar', nullable: false })
  color: string;

  @Column({ type: "json", nullable: true })
  geometry: { type: "Polygon"; coordinates: [number, number] };

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
