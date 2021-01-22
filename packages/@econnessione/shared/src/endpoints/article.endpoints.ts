import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Article } from "../io/http";
import { Output } from "../io/http/Common/Output";
import { GetListQuery } from "./Query";

export const ListArticles = Endpoint({
  Method: "GET",
  getPath: () => "/articles",
  Input: {
    Query: { ...GetListQuery.props },
  },
  Output: Output(t.array(Article.Article), "Articles"),
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/articles/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
  },
  Output: Output(Article.Article, "Articles"),
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/articles",
  Input: {
    Query: undefined,
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
  Output: Output(Article.Article, "Actor"),
});
