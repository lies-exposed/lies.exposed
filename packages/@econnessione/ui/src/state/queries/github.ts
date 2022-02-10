import { available, queryStrict } from "avenger";
import { api } from "../api";

export const githubRepo = queryStrict(
  ({ repo, user }: { repo: string; user: string }) =>
    api.get(`https://api.github.com/repos/${user}/${repo}`),
  available
);
