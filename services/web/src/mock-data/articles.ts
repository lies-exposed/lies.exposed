import { Article } from "@econnessione/shared/lib/io/http";
import uuid from "@utils/uuid";
import * as O from "fp-ts/lib/Option";
import { firstImage } from "./images";

export const firstArticle: Article.Article = {
  id: uuid(),
  type: "Article",
  title: "First article",
  path: "first-article",
  featuredImage: firstImage,
  links: O.none,
  draft: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: ""
};
