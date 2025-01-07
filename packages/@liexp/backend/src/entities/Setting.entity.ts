import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("settings")
@Index(["id"])
export class SettingEntity {
  @PrimaryColumn("varchar", { length: 255 })
  id: string;

  @Column({ type: "json", nullable: false })
  value: unknown;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
