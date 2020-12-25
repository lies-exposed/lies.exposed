import { Article } from "@econnessione/io"
import uuid from "@utils/uuid"
import * as O from "fp-ts/lib/Option"
import { firstImage } from "./images"

export const firstArticle: Article.ArticleFrontmatter = {
  id: uuid(),
  type: "ArticleFrontmatter",
  title: "First article",
  path: "first-article",
  featuredImage: firstImage,
  links: O.none,
  draft: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}
