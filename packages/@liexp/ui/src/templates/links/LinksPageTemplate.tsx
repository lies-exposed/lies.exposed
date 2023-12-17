import { type Link } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { AutocompleteLinkInput } from "../../components/Input/AutocompleteLinkInput";
import { MainContent } from "../../components/MainContent";
import { PageContent } from "../../components/PageContent";
import QueriesRenderer from "../../components/QueriesRenderer";
import { LinksList } from "../../components/lists/LinkList";
import { Box } from "../../components/mui";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider";
import { defaultUseQueryListParams } from "../../providers/EndpointQueriesProvider/params";

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
            <PageContent path="actors" />

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
