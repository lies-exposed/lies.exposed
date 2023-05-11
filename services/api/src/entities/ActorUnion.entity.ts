import { type UUID } from "io-ts-types/lib/UUID";
import {
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from "typeorm";
import { ActorEntity } from "./Actor.entity";

@Entity()
@Tree("closure-table")
export class ActorFamily {
  @PrimaryGeneratedColumn()
  id: UUID;

  @OneToOne(() => ActorEntity)
  subject: ActorEntity;

  @OneToOne(() => ActorEntity)
  partner: ActorEntity;

  @TreeChildren()
  children: ActorFamily[];

  @TreeParent()
  father: ActorFamily;

  @TreeParent()
  mother: ActorFamily;
}
