import {
  UserStatus,
  UserStatusPending,
} from "@liexp/shared/lib/io/http/User.js";
import { AuthPermission } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { Column, Entity, Index, OneToMany, type Relation } from "typeorm";
import { EventSuggestionEntity } from "./EventSuggestion.entity.js";
import { GraphEntity } from "./Graph.entity.js";
import { LinkEntity } from "./Link.entity.js";
import { MediaEntity } from "./Media.entity.js";
import { StoryEntity } from "./Story.entity.js";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const USER_ENTITY_NAME = "user";

@Entity(USER_ENTITY_NAME)
export class UserEntity extends DeletableEntity {
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

  @Column({
    type: "enum",
    enum: UserStatus.members.map((t) => t.literals[0]),
    default: UserStatusPending.literals[0],
  })
  status: UserStatus;

  @Column({ type: "json", default: [] })
  permissions: AuthPermission[];

  // telegram auth
  @Column({ type: "varchar", unique: true, nullable: true })
  telegramId: string | null;

  @Column({ type: "varchar", unique: true, nullable: true })
  telegramToken: string | null;

  @OneToMany(() => EventSuggestionEntity, (e) => e.creator, {
    cascade: false,
    nullable: true,
  })
  eventSuggestions: Relation<EventSuggestionEntity[]>;

  @OneToMany(() => LinkEntity, (l) => l.creator)
  links: Relation<LinkEntity[]>;

  @OneToMany(() => MediaEntity, (m) => m.creator)
  media: Relation<MediaEntity[]>;

  @OneToMany(() => StoryEntity, (a) => a.creator)
  stories: Relation<StoryEntity[]>;

  @OneToMany(() => GraphEntity, (a) => a.creator)
  graphs: Relation<GraphEntity[]>;
}
