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

    return axios
      .get(
        `https://api.github.com/repos/${queryKey[1].user}/${queryKey[1].repo}`,
        {},
      )
      .then((res) => res.data as { stargazers_count: number });
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
