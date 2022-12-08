import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import SEO from "@liexp/ui/components/SEO";
import ArticlesBox from "@liexp/ui/containers/ArticlesBox";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const BlogPage: React.FC<RouteComponentProps> = () => {
  const navigateTo = useNavigateToResource();

  return (
    <>
      <MainContent>
        <PageContent path="stories" />
        <SEO title="Stories" image="" urlPath={`stories`} />
        <ArticlesBox
          params={{
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "DESC" },
            filter: { draft: false },
          }}
          style={{ marginBottom: 100 }}
          onItemClick={(a) => {
            navigateTo.stories({ path: a.path });
          }}
        />
      </MainContent>
    </>
  );
};
export default BlogPage;
