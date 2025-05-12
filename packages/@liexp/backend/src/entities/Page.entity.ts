import { BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export const PAGE_ENTITY_NAME = "page";

@Entity(PAGE_ENTITY_NAME)
@Index(["path"], { unique: true })
export class PageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar", unique: true })
  path: string;

  @Column({ type: "json", nullable: true })
  excerpt: BlockNoteDocument;

  @Column({ type: "varchar", nullable: true })
  body: string | null;

  @Column({ type: "json", nullable: true })
  body2: BlockNoteDocument | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
