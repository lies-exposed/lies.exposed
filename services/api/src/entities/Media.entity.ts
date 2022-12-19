import { MediaType } from "@liexp/shared/io/http/Media";
import { UUID } from "io-ts-types/lib/UUID";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { AreaEntity } from "./Area.entity";
import { ArticleEntity } from "./Article.entity";
import { EventV2Entity } from "./Event.v2.entity";
import { KeywordEntity } from "./Keyword.entity";
import { LinkEntity } from "./Link.entity";
import { UserEntity } from "./User.entity";

@Entity("image")
export class MediaEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar", nullable: true })
  thumbnail: string | null;

  @Column({ type: "varchar", nullable: false })
  location: string;

  @Column({ type: "varchar", nullable: false })
  description: string;

  @Column({
    type: "enum",
    enum: MediaType.types.map((t) => t.value),
    default: MediaType.types[0].value,
  })
  type: MediaType;

  @ManyToOne(() => UserEntity, (u) => u.media, { cascade: false })
  creator: UserEntity;

  @ManyToMany(() => EventV2Entity, (e) => e.media, { cascade: false })
  events: EventV2Entity[];

  @OneToMany(() => LinkEntity, (e) => e.image, { cascade: false })
  links: LinkEntity[];

  @ManyToMany(() => AreaEntity, (a) => a.media)
  areas: AreaEntity[];

  @OneToMany(() => ArticleEntity, (a) => a.featuredImage, { cascade: false })
  articles: ArticleEntity[];

  @ManyToMany(() => KeywordEntity, (a) => a.media, { cascade: false })
  keywords: KeywordEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
