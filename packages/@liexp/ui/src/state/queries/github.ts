import { type APIError } from "@liexp/shared/providers/http/http.provider";
import { useQuery, type UseQueryResult } from "react-query";
import { foldTE } from "../../providers/DataProvider";
import { api } from "../api";

export const fetchGithubRepo = ({ queryKey }: any): Promise<any> => {
  if (process.env.NODE_ENV === "development") {
    return Promise.resolve({
      stargazers_count: 10,
    });
  }
  return foldTE(
    api.get(
      `https://api.github.com/repos/${queryKey[1].user}/${queryKey[1].repo}`
    )
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
