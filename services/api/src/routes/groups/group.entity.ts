import { io } from "@econnessione/shared";
import { ActorEntity } from "@routes/actors/actor.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("groups")
export class GroupEntity {
  type: "GroupFrontmatter";

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar", length: 6 })
  color: string;

  @Column({ type: "varchar", nullable: true })
  avatar: string;

  // @OneToMany(() => GroupEntity, (g) => g.id, { nullable: true })
  // @JoinTable({
  //   name: "group_subgroups",
  //   joinColumn: {
  //     name: "group",
  //     referencedColumnName: "id",
  //   },
  //   inverseJoinColumn: {
  //     name: "group",
  //     referencedColumnName: "id",
  //   }
  // })
  // subGroups: GroupEntity[];

  @Column({
    enum: io.http.Group.GroupKind.types.map((t) => t.value),
    type: "enum",
  })
  kind: io.http.Group.GroupKind;

  @ManyToMany(() => ActorEntity, (a) => a.groups, { nullable: true })
  @JoinTable()
  members: ActorEntity[];

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
