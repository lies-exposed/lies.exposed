import { APIError } from "@liexp/shared/providers/api.provider";
import { useQuery, UseQueryResult } from "react-query";
// import { foldTE } from "../../providers/DataProvider";
// import { api } from "../api";

export const fetchGithubRepo = ({ queryKey }: any): Promise<any> =>
  Promise.resolve({
    stargazers_count: 10
  });
  //  foldTE(
  //       api.get(
  //         `https://api.github.com/repos/${queryKey[1].user}/${queryKey[1].repo}`
  //       )
  //     );

export const githubRepo = ({
  repo,
  user,
}: {
  repo: string;
  user: string;
}): UseQueryResult<any, APIError> =>
  useQuery(["github", { user, repo }], fetchGithubRepo);
