import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

const GITHUB_REPO_STATS_KEY = (owner: string, repo: string): string =>
  `github:repo:stats:${owner}:${repo}`;

export const MakeListGithubRepoStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.GithubRepoStats.List,
    ({ query: { owner, repo } }) => {
      const ownerVal = owner ?? "lies-exposed";
      const repoVal = repo ?? "lies.exposed";

      return pipe(
        ctx.redis.get(GITHUB_REPO_STATS_KEY(ownerVal, repoVal)),
        TE.mapLeft(toControllerError),
        TE.map((raw) => {
          if (raw === null) {
            return {
              body: { data: [], total: 0 },
              statusCode: 200 as const,
            };
          }
          const stats = JSON.parse(raw) as {
            stargazers_count: number;
            forks_count: number;
            open_issues_count: number;
            watchers_count: number;
            updatedAt: string;
          };
          return {
            body: {
              data: [
                {
                  id: `${ownerVal}/${repoVal}`,
                  owner: ownerVal,
                  repo: repoVal,
                  ...stats,
                  createdAt: stats.updatedAt,
                },
              ],
              total: 1,
            },
            statusCode: 200 as const,
          };
        }),
      );
    },
  );
};
