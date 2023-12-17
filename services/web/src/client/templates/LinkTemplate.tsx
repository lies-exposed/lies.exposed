import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import SEO from "@liexp/ui/lib/components/SEO";
import { Box } from "@liexp/ui/lib/components/mui";
import { LinkTemplateUI } from "@liexp/ui/lib/templates/links/LinkTemplateUI";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const LinkTemplate: React.FC<{ linkId: string }> = ({ linkId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const { tab = "0" } = useRouteQuery();

  return (
    <QueriesRenderer
      queries={(Q) => ({
        link: Q.Link.get.useQuery({ id: linkId }),
      })}
      render={({ link }) => {
        return (
          <Box>
            <SEO
              title={link.title ?? link.description ?? link.url}
              image={link.image?.thumbnail ?? ""}
              urlPath={`link/${link.id}`}
            />
            <LinkTemplateUI
              link={link}
              tab={parseInt(tab, 10)}
              onTabChange={(t) => {
                navigateToResource.links({ id: link.id }, { tab: t });
              }}
              onEventClick={(e) => {
                navigateToResource.events({ id: e.id });
              }}
              onKeywordClick={(k) => {
                navigateToResource.keywords({ id: k.id });
              }}
            />
          </Box>
        );
      }}
    />
  );
};

export default LinkTemplate;
