import * as t from "io-ts";
import { UUID } from "io-ts-types/UUID";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { Article } from "../io/http";
import { Output } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const ListArticlesQuery = t.type(
  {
    ...GetListQuery.props,
    draft: optionFromNullable(BooleanFromString),
    exclude: optionFromNullable(t.array(UUID)),
    path: optionFromNullable(t.string),
    creator: optionFromNullable(UUID),
  },
  "ListArticlesQuery"
);
export const ListArticles = Endpoint({
  Method: "GET",
  getPath: () => "/articles",
  Input: {
    Query: ListArticlesQuery,
  },
  Output: Output(t.array(Article.Article), "Article"),
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/articles/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: Output(Article.Article, "Article"),
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/articles",
  Input: {
    Body: t.strict(
      {
        title: t.string,
        path: t.string,
        draft: t.boolean,
        date: DateFromISOString,
        featuredImage: optionFromNullable(UUID),
        creator: optionFromNullable(UUID),
        body2: t.unknown,
        keywords: t.array(UUID),
      },
      "CreateArticleBody"
    ),
  },
  Output: Output(Article.Article, "Article"),
});

const EditArticle = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/articles/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict(
      {
        title: t.string,
        path: t.string,
        draft: t.boolean,
        creator: UUID,
        date: DateFromISOString,
        featuredImage: optionFromNullable(t.strict({ id: UUID })),
        body2: t.unknown,
        keywords: t.array(UUID),
      },
      "EditArticleBody"
    ),
  },
  Output: Output(Article.Article, "Article"),
});

const DeleteArticle = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/articles/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: Output(Article.Article, "Article"),
});

export const articles = ResourceEndpoints({
  Get,
  List: ListArticles,
  Create,
  Edit: EditArticle,
  Delete: DeleteArticle,
  Custom: {},
});
