import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox.js";
import StoriesBox from "@liexp/ui/lib/containers/StoriesBox.js";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";
import { useNavigateToResource } from "../../utils/location.utils.js";

const BlogPage: React.FC<RouteComponentProps> = () => {
  const navigateTo = useNavigateToResource();

  return (
    <>
      <SEO title="Stories" image="" urlPath={`stories`} />
      <MainContent>
        <PageContentBox path="stories" />
      </MainContent>

      <StoriesBox
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
