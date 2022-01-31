import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { ContentWithSideNavigation } from "@econnessione/ui/components/ContentWithSideNavigation";
import { KeywordPageContent } from "@econnessione/ui/components/KeywordPageContent";
import SEO from "@econnessione/ui/components/SEO";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { useQueries } from "avenger/lib/react";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import InfiniteEventList from "@containers/InfiniteEventList";

const TopicTimelineTemplate: React.FunctionComponent<{ keywordId: string }> = ({
  keywordId,
}) => {
  const queries = useQueries(
    { keyword: Queries.Keyword.get },
    {
      keyword: { id: keywordId },
    }
  );
  return pipe(
    queries,
    QR.fold(LazyFullSizeLoader, ErrorBox, ({ keyword }) => {
      return (
        <ContentWithSideNavigation items={[]}>
          <SEO title={"keywords"} />
          <KeywordPageContent {...keyword} />
          <InfiniteEventList
            hash={`keyword-${keywordId}`}
            filters={{
              keywords: [keyword.id],
            }}
            onActorClick={() => {}}
            onGroupClick={() => {}}
            onGroupMemberClick={() => {}}
            onKeywordClick={() => {}}
          />
        </ContentWithSideNavigation>
      );
    })
  );
};

export default TopicTimelineTemplate;
