import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import SEO from "@liexp/ui/lib/components/SEO";
import { StoryPageContent } from "@liexp/ui/lib/components/stories/StoryPageContent";
import StoriesBox from "@liexp/ui/lib/containers/StoriesBox";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import NotFoundPage from "../pages/404";
import { useNavigateToResource } from "../utils/location.utils";

const StoryTemplate: React.FC<{ storyPath: string }> = ({ storyPath }) => {
  const navigateTo = useNavigateToResource();
  return pipe(
    O.fromNullable(storyPath),
    O.fold(
      () => <NotFoundPage />,
      (articlePath) => (
        <QueriesRenderer
          queries={(Q) => ({
            article: Q.Story.Custom.GetByPath.useQuery(articlePath),
          })}
          render={({ article }) => (
            <>
              <SEO
                title={article.title}
                image={article.featuredImage?.location}
                urlPath={`blog/${article.path}`}
              />
              <StoryPageContent
                story={{ ...article }}
                onKeywordClick={(k) => {
                  navigateTo.keywords({ id: k.id });
                }}
                onActorClick={(a) => {
                  navigateTo.actors({ id: a.id });
                }}
                onGroupClick={(g) => {
                  navigateTo.groups({ id: g.id });
                }}
                onMediaClick={(m) => {
                  navigateTo.media({ id: m.id });
                }}
                onEventClick={(e) => {
                  navigateTo.events({ id: e.id });
                }}
              />

              <StoriesBox
                params={{
                  pagination: {
                    perPage: 3,
                    page: 1,
                  },
                  sort: { field: "updatedAt", order: "DESC" },
                  filter: {
                    draft: false,
                    exclude: [article.id],
                  },
                }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "2rem",
                }}
                onItemClick={(a) => {
                  navigateTo.stories({ path: a.path });
                }}
              />
            </>
          )}
        />
      ),
    ),
  );
};

export default StoryTemplate;
