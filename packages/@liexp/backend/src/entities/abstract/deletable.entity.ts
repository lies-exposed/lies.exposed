import { DeleteDateColumn } from "typeorm";
import { BaseEntity } from "./base.entity.js";

export abstract class DeletableEntity extends BaseEntity {
  @DeleteDateColumn()
  deletedAt: Date | null;
}
