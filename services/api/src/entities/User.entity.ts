import {
  type UserPermission,
  UserStatus,
  UserStatusPending,
} from "@liexp/shared/lib/io/http/User";
import { type UUID } from "io-ts-types/lib/UUID";
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
import { EventSuggestionEntity } from "./EventSuggestion.entity";
import { LinkEntity } from "./Link.entity";
import { MediaEntity } from "./Media.entity";
import { StoryEntity } from "./Story.entity";

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

  @Column({
    type: "enum",
    enum: UserStatus.types.map((t) => t.value),
    default: UserStatusPending.value,
  })
  status: UserStatus;

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

  @OneToMany(() => StoryEntity, (a) => a.creator)
  stories: StoryEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
