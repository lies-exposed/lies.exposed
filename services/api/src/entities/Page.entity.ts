import { UUID } from "io-ts-types/lib/UUID";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("page")
@Index(["path"], { unique: true })
export class PageEntity {
  type: "PageFrontmatter";

  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", unique: true })
  path: string;

  @Column({ type: "varchar" })
  body: string;

  @Column({ type: "json", nullable: true })
  body2: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
