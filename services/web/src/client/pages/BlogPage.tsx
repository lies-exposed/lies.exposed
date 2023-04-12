import { MainContent } from "@liexp/ui/lib/components/MainContent";
import { PageContent } from "@liexp/ui/lib/components/PageContent";
import SEO from "@liexp/ui/lib/components/SEO";
import ArticlesBox from "@liexp/ui/lib/containers/ArticlesBox";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const BlogPage: React.FC<RouteComponentProps> = () => {
  const navigateTo = useNavigateToResource();

  return (
    <>
      <SEO title="Stories" image="" urlPath={`stories`} />
      <MainContent>
        <PageContent path="stories" />
      </MainContent>

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
    </>
  );
};
export default BlogPage;
