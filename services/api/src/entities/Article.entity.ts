import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("article")
export class ArticleEntity {
  type: "Article";

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "boolean", default: true })
  draft: boolean;

  @Column({ type: "varchar" })
  path: string;

  @Column({ type: "timestamptz", nullable: true })
  date: Date | null;

  @Column({ type: "varchar", nullable: true })
  featuredImage: string | null;

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
