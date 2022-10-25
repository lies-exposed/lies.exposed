import { URL } from "@liexp/shared/io/http/Common";
import { UUID } from "io-ts-types";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventV2Entity } from "./Event.v2.entity";
import { KeywordEntity } from "./Keyword.entity";
import { MediaEntity } from "./Media.entity";
import { UserEntity } from "./User.entity";

@Entity("link")
@Index(["url"], { unique: true })
export class LinkEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar", nullable: false })
  url: URL;

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

  @ManyToOne(() => UserEntity, (u) => u.links, { nullable: true })
  creator: UserEntity | null;

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
