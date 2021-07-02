import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Article } from "../io/http";
import { Output } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

export const ListArticles = Endpoint({
  Method: "GET",
  getPath: () => "/articles",
  Input: {
    Query: GetListQuery,
  },
  Output: Output(t.array(Article.Article), "Articles"),
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/articles/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: Output(Article.Article, "Articles"),
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/articles",
  Input: {
    Body: t.strict(
      {
        title: t.string,
        slug: t.string,
        avatar: optionFromNullable(
          t.strict({
            src: t.string,
            path: t.string,
          })
        ),
        body: t.string,
      },
      "AddActorBody"
    ),
  },
  Output: Output(Article.Article, "Article"),
});

export const articles = ResourceEndpoints({
  Get,
  List: ListArticles,
  Create,
  Edit: Endpoint({
    Method: "PUT",
    getPath: () => `/articles`,
    Input: {
      Body: t.unknown,
    },
    Output: Output(Article.Article, "Article"),
  }),
  Delete: Endpoint({
    Method: "DELETE",
    getPath: () => `/articles`,
    Output: Output(Article.Article, "Article"),
  }),
});
