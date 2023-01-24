import { type Tag, type Color } from "@liexp/shared/io/http/Common";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ArticleEntity } from './Article.entity';
import { EventV2Entity } from "./Event.v2.entity";
import { LinkEntity } from "./Link.entity";
import { MediaEntity } from './Media.entity';

@Entity("keyword")
@Index(["tag"], { unique: true })
export class KeywordEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  tag: Tag;

  @Column({ type: "varchar", length: 6, nullable: true })
  color: Color | null;

  @ManyToMany(() => EventV2Entity, (e) => e.keywords, { cascade: false })
  events: EventV2Entity[];

  @ManyToMany(() => LinkEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  links: LinkEntity[];

  @ManyToMany(() => ArticleEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  articles: ArticleEntity[];

  @ManyToMany(() => MediaEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  media: MediaEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  eventCount: number

  linkCount: number

}
