import { KeywordTemplate } from "@liexp/ui/templates/KeywordTemplate";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const KeywordPage: React.FC<{ keywordId: string }> = ({ keywordId }) => {
  const { tab: _tab = "0", ...query } = useRouteQuery();
  const navigateTo = useNavigateToResource();

  const tab = React.useMemo(() => parseInt(_tab, 10), [_tab]);

  return (
    <KeywordTemplate
      id={keywordId}
      tab={tab}
      query={query}
      onTabChange={(tab) => {
        navigateTo.keywords({ id: keywordId }, { tab });
      }}
      onKeywordClick={(k) => {
        navigateTo.keywords(
          { id: keywordId },
          {
            ...query,
            tab: "1",
            keywords: [k.id],
          }
        );
      }}
      onEventClick={(e) => {
        navigateTo.events({ id: e.id });
      }}
      onMediaClick={(m) => {
        navigateTo.media({ id: m.id });
      }}
      onQueryChange={(q) => {
        navigateTo.keywords({ id: keywordId }, { ...q, tab });
      }}
    />
  );
};

export default KeywordPage;
