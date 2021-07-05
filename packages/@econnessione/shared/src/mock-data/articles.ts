import { Article } from "@io/http";
import { uuid } from "@utils/uuid";
import { firstImage } from "./images";

export const firstArticle: Article.Article = {
  id: uuid(),
  type: "Article",
  title: "First article",
  path: "first-article",
  featuredImage: firstImage.location,
  links: [],
  draft: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  body: `
  ## Subtitle
  
  Paragraph

  > Quote from an important person
`,
};
