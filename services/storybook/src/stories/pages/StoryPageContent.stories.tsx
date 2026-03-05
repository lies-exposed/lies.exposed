import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  StoryPageContent,
  type StoryPageContentProps,
} from "@liexp/ui/lib/components/stories/StoryPageContent.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/StoryPageContent",
  component: StoryPageContent,
};

export default meta;

const Template: StoryFn<StoryPageContentProps> = (props) => {
  const [index, setIndex] = React.useState(0);
  return (
    <QueriesRenderer
      queries={(Q) => ({
        article: Q.Story.list.useQuery(
          undefined,
          {
            draft: "true",
            _sort: "date",
            _order: "DESC",
          },
          false,
        ),
      })}
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
            <StoryPageContent {...props} story={art} />
          </>
        ) : (
          <div />
        );
      }}
    />
  );
};

const ArticlePageContentExample = Template.bind({});

ArticlePageContentExample.args = { story: {} as any };

export { ArticlePageContentExample };
