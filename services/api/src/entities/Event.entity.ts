import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ImageEntity } from "./Image.entity";
import { LinkEntity } from "./Link.entity";

@Entity("event")
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  title: string;

  @Column({ type: "timestamptz", nullable: false })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date | null;

  @Column({ type: "json", nullable: true })
  location: { type: "Point"; coordinates: [number, number] };

  @ManyToMany(() => LinkEntity, { cascade: true })
  @JoinTable()
  links: LinkEntity[];

  @ManyToMany(() => ImageEntity, { cascade: true })
  @JoinTable()
  images: ImageEntity[];

  @ManyToMany(() => GroupEntity, (a) => a.events)
  @JoinTable()
  groups: GroupEntity[];

  @ManyToMany(() => ActorEntity, (a) => a.events)
  @JoinTable()
  actors: ActorEntity[];

  @Column({ type: "varchar" })
  body: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
