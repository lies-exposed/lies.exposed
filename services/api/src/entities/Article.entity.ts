import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne, PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { MediaEntity } from "./Media.entity";
import { UserEntity } from "./User.entity";

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

  @ManyToOne(() => MediaEntity, (v) => v.articles, {
    cascade: false,
    nullable: true,
  })
  featuredImage: MediaEntity | null;

  @Column({ type: "varchar", nullable: true })
  excerpt: string | null;

  @Column({ type: "varchar" })
  body: string;

  @Column({ type: "json", nullable: true })
  body2: Record<string, unknown> | null;

  @ManyToOne(() => UserEntity, (u) => u.articles, {
    cascade: false,
    nullable: true,
  })
  creator: UserEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
