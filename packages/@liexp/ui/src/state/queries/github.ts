import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { type IOError } from "@ts-endpoint/core";
import axios from "axios";
import { type Configuration } from "../../context/ConfigurationContext.js";

interface GithubRepo {
  user: string;
  repo: string;
}

export const fetchGithubRepo =
  (conf: Configuration) =>
  async ({ queryKey }: any): Promise<{ stargazers_count: number }> => {
    if (conf.isDev) {
      return Promise.resolve({
        stargazers_count: 10,
      });
    }

    const { user, repo } = queryKey[1] as GithubRepo;
    return axios
      .get(
        `${conf.platforms.api.url}/github-repo-stats?owner=${encodeURIComponent(user)}&repo=${encodeURIComponent(repo)}`,
      )
      .then((res) => {
        const items: { stargazers_count: number }[] = res.data?.data ?? [];
        return items[0] ?? { stargazers_count: 0 };
      });
  };

export const githubRepo =
  (conf: Configuration) =>
  ({ repo, user }: GithubRepo): UseQueryResult<any, IOError> =>
    useQuery({
      queryKey: ["github", { user, repo }],
      queryFn: fetchGithubRepo(conf),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 60,
    });
