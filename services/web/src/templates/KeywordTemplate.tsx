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

const KeywordTemplate: React.FunctionComponent<{ keywordId: string }> = ({
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
            queryFilters={{
              keywords: [keyword.id],
            }}
            filters={{
              uncategorized: true,
              scientificStudies: true,
              deaths: true,
            }}
            totals={{ uncategorized: 0, deaths: 0, scientificStudies: 0 }}
            onBottomReached={() => {}}
            events={[]}
            actors={[]}
            groups={[]}
            keywords={[]}
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

export default KeywordTemplate;
