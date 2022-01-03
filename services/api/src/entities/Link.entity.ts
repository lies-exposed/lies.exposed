import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity";
import { KeywordEntity } from "./Keyword.entity";
import { DeathEntity } from "./events/DeathEvent.entity";

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

  @Column({ type: "varchar", nullable: true })
  image: string | null;

  @Column({ type: "timestamptz", nullable: true })
  publishDate: Date | null;

  @Column({ type: "varchar", nullable: true })
  provider: string;

  @ManyToMany(() => EventV2Entity, (e) => e.links, { cascade: false })
  events: EventV2Entity[];

  @ManyToMany(() => DeathEntity, (e) => e.links, { cascade: false })
  death: DeathEntity;

  @ManyToMany(() => KeywordEntity, (e) => e.links, { cascade: false })
  keywords: KeywordEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
