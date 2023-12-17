import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { pipe } from "fp-ts/lib/function";
import { useQuery, type UseQueryResult } from "react-query";
import { api } from "../api";

export const fetchGithubRepo = ({ queryKey }: any): Promise<any> => {
  if (process.env.NODE_ENV === "development") {
    return Promise.resolve({
      stargazers_count: 10,
    });
  }
  return pipe(
    api.get(
      `https://api.github.com/repos/${queryKey[1].user}/${queryKey[1].repo}`,
    ),
    throwTE,
  );
};

export const githubRepo = ({
  repo,
  user,
}: {
  repo: string;
  user: string;
}): UseQueryResult<any, APIError> =>
  useQuery(["github", { user, repo }], fetchGithubRepo, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    cacheTime: 10 * 60 * 60,
  });
