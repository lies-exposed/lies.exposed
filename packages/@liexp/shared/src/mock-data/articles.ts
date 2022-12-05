import { Article } from "../io/http";
import { uuid } from "../utils/uuid";
import { firstImage } from "./images";

export const firstArticle: Article.Article = {
  id: uuid() as any,
  title: "First article",
  path: "first-article",
  featuredImage: firstImage,
  links: [],
  draft: false,
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  body2: {},
  body: `
  ## Subtitle

  Paragraph

  > Quote from an important person
`,
};
