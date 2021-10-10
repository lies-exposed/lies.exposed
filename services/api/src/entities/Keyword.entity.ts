import { Tag } from "@econnessione/shared/io/http/Common";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventEntity } from "./Event.entity";
import { LinkEntity } from "./Link.entity";

@Entity("keyword")
@Index(["tag"], { unique: true })
export class KeywordEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  tag: Tag;

  @ManyToMany(() => EventEntity, (e) => e.keywords, { cascade: false })
  events: EventEntity[];

  @ManyToMany(() => LinkEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  links: LinkEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
