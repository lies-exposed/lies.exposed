import { type DatabaseClient } from "../providers/orm/index.js";

export interface DatabaseContext {
  db: DatabaseClient;
}
