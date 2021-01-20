import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("articles")
export class ArticleEntity {
  type: "Article";

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar" })
  slug: string;

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
