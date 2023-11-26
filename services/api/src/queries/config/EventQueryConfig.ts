import { type WhereExpressionBuilder } from "typeorm";

export interface EventQueryConfig {
  whereActorsIn: (qb: WhereExpressionBuilder, actorIds: string[]) => WhereExpressionBuilder;
  whereGroupsIn: (qb: WhereExpressionBuilder, groupIds: string[]) => WhereExpressionBuilder;
  whereTitleIn: (qb: WhereExpressionBuilder) => string;
}
