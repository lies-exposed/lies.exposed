import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { LinkTemplateUI } from "@liexp/ui/lib/templates/links/LinkTemplateUI.js";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils.js";

const LinkTemplate: React.FC<{ linkId: UUID }> = ({ linkId }) => {
  // const params = useParams();
  const navigateToResource = useNavigateToResource();
  const rawQuery = useRouteQuery<Record<string, string | string[]>>();

  const tab = React.useMemo(() => {
    const rawTab = rawQuery.tab;
    return typeof rawTab === "string"
      ? parseInt(rawTab, 10)
      : rawTab !== undefined && rawTab.length > 0
        ? parseInt(rawTab[0], 10)
        : 0;
  }, [rawQuery.tab]);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        link: Q.Link.get.useQuery({ id: linkId }),
      })}
      render={({ link: { data: link } }) => {
        return (
          <Box>
            <SEO
              title={link.title ?? link.description ?? link.url}
              image={link.image?.thumbnail ?? ""}
              urlPath={`link/${link.id}`}
            />
            <LinkTemplateUI
              link={link}
              tab={tab}
              onTabChange={(t) => {
                navigateToResource.links({ id: link.id }, { tab: String(t) });
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
