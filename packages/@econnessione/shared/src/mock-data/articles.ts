import { Article } from "@io/http";
import uuid from "@utils/uuid";
import { firstImage } from "./images";

export const firstArticle: Article.Article = {
  id: uuid(),
  type: "Article",
  title: "First article",
  path: "first-article",
  featuredImage: firstImage,
  links: [],
  draft: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: ""
};
