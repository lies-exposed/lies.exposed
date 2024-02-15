import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

export const fetchGithubRepo =
  (api: APIRESTClient) =>
  ({ queryKey }: any): Promise<any> => {
    if (process.env.NODE_ENV === "development") {
      return Promise.resolve({
        stargazers_count: 10,
      });
    }
    return api.get(
      `https://api.github.com/repos/${queryKey[1].user}/${queryKey[1].repo}`,
      {},
    );
  };

export const githubRepo =
  (api: APIRESTClient) =>
  ({
    repo,
    user,
  }: {
    repo: string;
    user: string;
  }): UseQueryResult<any, APIError> =>
    useQuery({
      queryKey: ["github", { user, repo }],
      queryFn: fetchGithubRepo(api),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 60,
    });
