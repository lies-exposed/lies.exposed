import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DeathEventEntity } from "./DeathEvent.entity";
import { EventEntity } from "./Event.entity";
import { KeywordEntity } from "./Keyword.entity";

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
  image: string;

  @Column({ type: "timestamptz", nullable: true })
  publishDate: Date;

  @Column({ type: "varchar", nullable: true })
  provider: string;

  @ManyToMany(() => EventEntity, (e) => e.links, { cascade: false })
  events: EventEntity[];

  @ManyToMany(() => DeathEventEntity, (e) => e.news, { cascade: false })
  death: DeathEventEntity;

  @ManyToMany(() => KeywordEntity, (e) => e.links, { cascade: false })
  keywords: KeywordEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
