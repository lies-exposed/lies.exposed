import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { ActorEntity } from "./Actor.entity";
import { GroupEntity } from "./Group.entity";
import { GroupMemberEntity } from "./GroupMember.entity";

@Entity("legal_action")
export class LegalActionEntity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  title: string;

  @ManyToMany(() => GroupMemberEntity, (member) => member.legalActions)
  respondentMemberIn: GroupMemberEntity[];

  @ManyToMany(() => ActorEntity, (member) => member.legalActions)
  respondentActor: ActorEntity[];

  @ManyToMany(() => GroupEntity, (member) => member.legalActions)
  respondentGroups: GroupEntity[];

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
