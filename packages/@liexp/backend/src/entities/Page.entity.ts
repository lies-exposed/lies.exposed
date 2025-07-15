import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { Column, Entity, Index } from "typeorm";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const PAGE_ENTITY_NAME = "page";

@Entity(PAGE_ENTITY_NAME)
@Index(["path"], { unique: true })
export class PageEntity extends DeletableEntity {
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
}
