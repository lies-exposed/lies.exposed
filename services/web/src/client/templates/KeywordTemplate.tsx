import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { KeywordTemplate } from "@liexp/ui/lib/templates/KeywordTemplate";
import { useRouteQuery } from "@liexp/ui/lib/utils/history.utils.js";
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
      query={{
        ...query,
        eventType: query.eventType ?? EventType.types.map((t) => t.value),
      }}
      onTabChange={(tab) => {
        navigateTo.keywords({ id: keywordId }, { tab });
      }}
      onKeywordClick={(k) => {
        navigateTo.keywords(
          { id: k.id },
          {
            tab: 1,
          },
        );
      }}
      onEventClick={(e) => {
        navigateTo.events({ id: e.id }, { tab: 0 });
      }}
      onMediaClick={(m) => {
        navigateTo.media({ id: m.id }, { tab: 0 });
      }}
      onActorClick={(m) => {
        navigateTo.actors({ id: m.id }, { tab: 0 });
      }}
      onGroupClick={(g) => {
        navigateTo.groups({ id: g.id }, { tab: 0 });
      }}
      onQueryChange={(q) => {
        navigateTo.keywords({ id: keywordId }, { ...q, tab });
      }}
    />
  );
};

export default KeywordPage;
