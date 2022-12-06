import { UserPermission } from "@liexp/shared/io/http/User";
import { UUID } from "io-ts-types/lib/UUID";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ArticleEntity } from "./Article.entity";
import { EventSuggestionEntity } from "./EventSuggestion.entity";
import { LinkEntity } from "./Link.entity";
import { MediaEntity } from "./Media.entity";

@Entity("user")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: UUID;

  @Column({ type: "varchar" })
  firstName: string;

  @Column({ type: "varchar" })
  lastName: string;

  @Column({ type: "varchar" })
  @Index({ unique: true })
  username: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar" })
  passwordHash: string;

  @Column({ type: "json", default: [] })
  permissions: UserPermission[];

  @OneToMany(() => EventSuggestionEntity, (e) => e.creator, {
    cascade: false,
    nullable: true,
  })
  eventSuggestions: EventSuggestionEntity[];

  @OneToMany(() => LinkEntity, (l) => l.creator)
  links: LinkEntity[];

  @OneToMany(() => MediaEntity, (m) => m.creator)
  media: MediaEntity[];

  @OneToMany(() => ArticleEntity, (a) => a.creator)
  articles: ArticleEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
