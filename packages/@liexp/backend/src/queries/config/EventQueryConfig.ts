import { type WhereExpressionBuilder } from "typeorm";

export interface EventQueryConfig {
  whereActorsIn: (
    qb: WhereExpressionBuilder,
    actorIds: readonly string[],
  ) => WhereExpressionBuilder;
  whereGroupsIn: (
    qb: WhereExpressionBuilder,
    groupIds: readonly string[],
  ) => WhereExpressionBuilder;
  whereMediaIn: (
    qb: WhereExpressionBuilder,
    mediaIds: readonly string[],
  ) => WhereExpressionBuilder;
  whereTitleIn: (qb: WhereExpressionBuilder) => string;
}
