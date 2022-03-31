import { ListActorOutput } from "@liexp/shared/endpoints/actor.endpoints";
import { APIError } from "@liexp/shared/providers/api.provider";
import { available, queryStrict } from "avenger";
import * as TE from "fp-ts/lib/TaskEither";
import { GetListParams } from "react-admin";
import { Queries } from "../../providers/DataProvider";

export const emptyQuery = TE.right({
  data: [],
  total: 0,
});

export const actorsDiscreteQuery = queryStrict<
  GetListParams,
  APIError,
  ListActorOutput
>((input: GetListParams) => {
  return input.filter.ids.length === 0
    ? emptyQuery
    : Queries.Actor.getList.run(input as any);
}, available);

export const groupsDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? emptyQuery
      : Queries.Group.getList.run(input as any),
  available
);

export const groupsMembersDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? emptyQuery
      : Queries.GroupMember.getList.run(input as any),
  available
);

export const keywordsDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? emptyQuery
      : Queries.Keyword.getList.run(input as any),
  available
);

export const mediaDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? emptyQuery
      : Queries.Media.getList.run(input as any),
  available
);

export const linksDiscreteQuery = queryStrict(
  (input: GetListParams) =>
    input.filter.ids.length === 0
      ? emptyQuery
      : Queries.Link.getList.run(input as any),
  available
);
