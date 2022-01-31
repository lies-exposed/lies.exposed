import { Tag, Color } from "@econnessione/shared/io/http/Common";
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
import { EventV2Entity } from "./Event.v2.entity";
import { LinkEntity } from "./Link.entity";

@Entity("keyword")
@Index(["tag"], { unique: true })
export class KeywordEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  tag: Tag;


  @Column({ type: 'varchar', length: 7, nullable: true })
  color: Color;

  @ManyToMany(() => EventV2Entity, (e) => e.keywords, { cascade: false })
  events: EventV2Entity[];

  @ManyToMany(() => LinkEntity, (e) => e.keywords, { cascade: false })
  @JoinTable()
  links: LinkEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
