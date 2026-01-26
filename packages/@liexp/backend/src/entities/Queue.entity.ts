import {
  QueueResourceNames,
  QueueTypes,
  Status,
} from "@liexp/io/lib/http/Queue/index.js";
import { Queue } from "@liexp/io/lib/http/index.js";
import { Column, Entity } from "typeorm";
import { DeletableEntity } from "./abstract/deletable.entity.js";

export const QUEUE_ENTITY_NAME = "queue";

@Entity(QUEUE_ENTITY_NAME)
export class QueueEntity extends DeletableEntity {
  @Column({
    type: "enum",
    enum: QueueTypes.members.map((t) => t.literals[0]),
    default: QueueTypes.members[0].literals[0],
  })
  type: QueueTypes;

  @Column({
    type: "enum",
    enum: QueueResourceNames.members.map((t) => t.literals[0]),
    default: QueueResourceNames.members[0].literals[0],
  })
  resource: QueueResourceNames;

  @Column({
    type: "enum",
    enum: Status.members.map((t) => t.literals[0]),
    default: Status.members[0].literals[0],
  })
  status: Status;

  @Column({ type: "varchar", nullable: true })
  prompt: string | null;

  @Column({ type: "jsonb" })
  data: Queue.Queue["data"];

  @Column({ type: "jsonb", nullable: true })
  result: Queue.Queue["result"];

  @Column({ type: "jsonb", nullable: true })
  error: Queue.Queue["error"] | null;
}
