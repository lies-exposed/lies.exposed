import { type Link } from "@liexp/shared/lib/io/http/index.js";
import { defaultUseQueryListParams } from "@liexp/shared/lib/providers/EndpointQueriesProvider/params.js";
import * as React from "react";
import { AutocompleteLinkInput } from "../../components/Input/AutocompleteLinkInput.js";
import { MainContent } from "../../components/MainContent.js";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import { LinksList } from "../../components/lists/LinkList.js";
import { Box } from "../../components/mui/index.js";
import { PageContentBox } from "../../containers/PageContentBox.js";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";

export interface LinksPageTemplateProps {
  params?: any;
  onItemClick: (l: Link.Link) => void;
}

export const LinksPageTemplate: React.FC<LinksPageTemplateProps> = ({
  params = defaultUseQueryListParams,
  onItemClick,
}) => {
  const queries = useEndpointQueries();
  return (
    <QueriesRenderer
      queries={{
        actors: queries.Link.list.useQuery(params, undefined, false),
      }}
      render={({ actors: { data: actors } }) => {
        return (
          <MainContent style={{ height: "100%" }}>
            <PageContentBox path="actors" />

            <>
              <AutocompleteLinkInput selectedItems={[]} onChange={(c) => {}} />

              <Box style={{ marginTop: 40 }}>
                <LinksList
                  links={actors.map((a) => ({
                    ...a,
                    selected: true,
                  }))}
                  onItemClick={(a) => {
                    onItemClick(a);
                  }}
                />
              </Box>
            </>
          </MainContent>
        );
      }}
    />
  );
};
