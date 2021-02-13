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

  @Column({ type: "json", nullable: true })
  location: { type: "Polygon"; coordinates: [number, number] };

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
