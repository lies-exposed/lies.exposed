import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne, PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity";
import { KeywordEntity } from "./Keyword.entity";
import { MediaEntity } from "./Media.entity";

@Entity("link")
@Index(["url"], { unique: true })
export class LinkEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  url: string;

  @Column({ type: "varchar", nullable: true })
  title: string;

  @Column({ type: "varchar", nullable: true })
  description: string;

  @ManyToOne(() => MediaEntity, { nullable: true, cascade: true })
  @JoinColumn()
  image: MediaEntity | null;

  @Column({ type: "timestamptz", nullable: true })
  publishDate: Date | null;

  @Column({ type: "varchar", nullable: true })
  provider: string;

  @ManyToMany(() => EventV2Entity, (e) => e.links, { cascade: false })
  events: EventV2Entity[];

  @ManyToMany(() => KeywordEntity, (e) => e.links, { cascade: false })
  keywords: KeywordEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
