import { firstArticle } from "@liexp/shared/mock-data/articles";
import {
  ArticlePageContent,
  type ArticlePageContentProps,
} from "@liexp/ui/components/ArticlePageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useArticlesQuery } from "@liexp/ui/state/queries/article.queries";
import { type Meta, type Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/ArticlePageContent",
  component: ArticlePageContent,
};

export default meta;

const Template: Story<ArticlePageContentProps> = (props) => {
  const [index, setIndex] = React.useState(0);
  return (
    <QueriesRenderer
      queries={{
        article: useArticlesQuery({
          pagination: {
            perPage: 10,
            page: 1,
          },
          sort: { field: "date", order: "DESC" },
          filter: { draft: true },
        }, false),
      }}
      render={({ article }) => {
        const art = article.data[index];
        return art ? (
          <>
            <select
              onChange={(e) => {
                setIndex(parseInt(e.currentTarget.value ?? "0", 10));
              }}
            >
              {article.data.map((a, i) => (
                <option key={a.id} value={i}>
                  {a.title}
                </option>
              ))}
            </select>
            <ArticlePageContent article={art} onKeywordClick={() => {}} />
          </>
        ) : (
          <div />
        );
      }}
    />
  );
};

const ArticlePageContentExample = Template.bind({});

const args = {
  article: {} as any,
  // tableOfContents: O.none,
  // timeToRead: O.none,
};

ArticlePageContentExample.args = args;

export { ArticlePageContentExample };
