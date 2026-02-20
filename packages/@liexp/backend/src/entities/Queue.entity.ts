import * as Queue from "@liexp/io/lib/http/Queue/index.js";
import { Column, Entity } from "typeorm";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const QUEUE_ENTITY_NAME = "queue";

@Entity(QUEUE_ENTITY_NAME)
export class QueueEntity extends DeletableEntity {
  @Column({
    type: "enum",
    enum: Queue.QueueTypes.members.map((t) => t.literals[0]),
    default: Queue.QueueTypes.members[0].literals[0],
  })
  type: Queue.QueueTypes;

  @Column({
    type: "enum",
    enum: Queue.QueueResourceNames.members.map((t) => t.literals[0]),
    default: Queue.QueueResourceNames.members[0].literals[0],
  })
  resource: Queue.QueueResourceNames;

  @Column({
    type: "enum",
    enum: Queue.Status.members.map((t) => t.literals[0]),
    default: Queue.Status.members[0].literals[0],
  })
  status: Queue.Status;

  @Column({ type: "varchar", nullable: true })
  prompt: string | null;

  @Column({ type: "jsonb" })
  data: Queue.Queue["data"];

  @Column({ type: "jsonb", nullable: true })
  result: Queue.Queue["result"];

  @Column({ type: "jsonb", nullable: true })
  error: Queue.Queue["error"] | null;
}
