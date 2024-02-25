import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import axios from 'axios';
import { type Configuration } from "../../context/ConfigurationContext.js";

export const fetchGithubRepo =
  (conf: Configuration) =>
  ({ queryKey }: any): Promise<any> => {
    if (conf.isDev) {
      return Promise.resolve({
        stargazers_count: 10,
      });
    }

    return axios.get(
      `https://api.github.com/repos/${queryKey[1].user}/${queryKey[1].repo}`,
      {},
    );
  };

export const githubRepo =
  (conf: Configuration) =>
  ({
    repo,
    user,
  }: {
    repo: string;
    user: string;
  }): UseQueryResult<any, APIError> =>
    useQuery({
      queryKey: ["github", { user, repo }],
      queryFn: fetchGithubRepo(conf),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 60,
    });
