import { firstImage } from "./images";
import { Article } from "@io/http";
import { uuid } from "@utils/uuid";

export const firstArticle: Article.Article = {
  id: uuid(),
  title: "First article",
  path: "first-article",
  featuredImage: firstImage.location,
  links: [],
  draft: false,
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  body: `
  ## Subtitle
  
  Paragraph

  > Quote from an important person
`,
};
