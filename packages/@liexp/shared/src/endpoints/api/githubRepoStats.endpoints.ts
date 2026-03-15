import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

export const GithubRepoStatsSchema = Schema.Struct({
  id: Schema.String,
  owner: Schema.String,
  repo: Schema.String,
  stargazers_count: Schema.Number,
  forks_count: Schema.Number,
  open_issues_count: Schema.Number,
  watchers_count: Schema.Number,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

const List = Endpoint({
  Method: "GET",
  getPath: () => "/github-repo-stats",
  Input: {
    Query: Schema.Struct({
      owner: Schema.optional(Schema.String),
      repo: Schema.optional(Schema.String),
    }),
  },
  Output: Schema.Struct({
    data: Schema.Array(GithubRepoStatsSchema),
    total: Schema.Number,
  }),
});

const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/github-repo-stats/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: Schema.Struct({ data: GithubRepoStatsSchema }),
});

const Create = Endpoint({
  Method: "POST",
  getPath: () => "/github-repo-stats",
  Input: { Body: Schema.Unknown },
  Output: Schema.Unknown,
});

const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/github-repo-stats/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
    Body: Schema.Unknown,
  },
  Output: Schema.Unknown,
});

const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/github-repo-stats/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: Schema.Unknown,
});

export const githubRepoStats = ResourceEndpoints({
  Get,
  List,
  Create,
  Edit,
  Delete,
  Custom: {},
});
