import { APIError } from "@econnessione/shared/providers/api.provider";
import { available, queryStrict } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { GetListParams } from "react-admin";
import { Queries } from "../../providers/DataProvider";

export const actorsDiscreteQuery = queryStrict((input: GetListParams) => {
  return input.filter.ids.length === 0
    ? TE.right<APIError, any>({ data: [], total: 0 })
    : Queries.Actor.getList.run(input as any);
}, available);

export const groupsDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? TE.right<APIError, any>({ data: [], total: 0 })
      : Queries.Group.getList.run(input as any),
  available
);

export const groupsMembersDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? TE.right<APIError, { data: any[]; total: number }>({
          data: [],
          total: 0,
        })
      : Queries.GroupMember.getList.run(input as any),
  available
);

export const keywordsDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? TE.right<APIError, { data: any[]; total: number }>({
          data: [],
          total: 0,
        })
      : Queries.Keyword.getList.run(input as any),
  available
);

export const linksDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? TE.right<APIError, { data: any[]; total: number }>({
          data: [],
          total: 0,
        })
      : Queries.Link.getList.run(input as any),
  available
);
