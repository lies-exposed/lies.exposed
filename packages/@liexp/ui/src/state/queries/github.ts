import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { pipe } from "fp-ts/lib/function.js";
import { api } from "../api.js";

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
  useQuery({
    queryKey: ["github", { user, repo }],
    queryFn: fetchGithubRepo,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 60,
  });
