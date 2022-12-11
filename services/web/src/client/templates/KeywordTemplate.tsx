import { KeywordTemplate } from "@liexp/ui/templates/KeywordTemplate";
import { useRouteQuery } from "@liexp/ui/utils/history.utils";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const KeywordPage: React.FC<{ keywordId: string }> = ({ keywordId }) => {
  const t = useRouteQuery({ tab: "0" });
  const navigateTo = useNavigateToResource();

  const tab = React.useMemo(() => parseInt(t.tab, 10), [t]);

  return (
    <KeywordTemplate
      id={keywordId}
      tab={tab}
      onTabChange={(tab) => {
        navigateTo.keywords({ id: keywordId }, { tab });
      }}
      onKeywordClick={() => {}}
      onEventClick={(e) => {
        navigateTo.events({ id: e.id });
      }}
    />
  );
};

export default KeywordPage;
