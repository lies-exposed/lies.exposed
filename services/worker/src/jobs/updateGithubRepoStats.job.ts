import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CronJobTE } from "./cron-task.type.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError } from "#io/worker.error.js";

interface GithubRepoResponse {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
}

const GITHUB_REPO_STATS_TTL_SECONDS = 25 * 60 * 60; // 25 hours

const REPOS: { owner: string; repo: string }[] = [
  { owner: "lies-exposed", repo: "lies.exposed" },
];

const redisKey = (owner: string, repo: string): string =>
  `github:repo:stats:${owner}:${repo}`;

const fetchAndCacheRepo =
  ({ owner, repo }: { owner: string; repo: string }) =>
  (ctx: WorkerContext) => {
    return pipe(
      ctx.http.get<GithubRepoResponse>(
        `https://api.github.com/repos/${owner}/${repo}`,
      ),
      fp.TE.chain(
        ({
          stargazers_count,
          forks_count,
          open_issues_count,
          watchers_count,
        }) =>
          fp.TE.tryCatch(async () => {
            const value = JSON.stringify({
              stargazers_count,
              forks_count,
              open_issues_count,
              watchers_count,
              updatedAt: new Date().toISOString(),
            });
            await ctx.redis.client.setex(
              redisKey(owner, repo),
              GITHUB_REPO_STATS_TTL_SECONDS,
              value,
            );
          }, toWorkerError),
      ),
    );
  };

export const updateGithubRepoStatsJob: CronJobTE = () => {
  return pipe(
    REPOS,
    fp.A.traverse(fp.RTE.ApplicativeSeq)(fetchAndCacheRepo),
    fp.RTE.matchE(
      () => (ctx: WorkerContext) => {
        return fp.T.of(
          ctx.logger.error.log("Failed to update GitHub repo stats"),
        );
      },
      () => (ctx: WorkerContext) => {
        return fp.T.of(
          ctx.logger.info.log(
            "GitHub repo stats cached in Redis for %d repos",
            REPOS.length,
          ),
        );
      },
    ),
  );
};
