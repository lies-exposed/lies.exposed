import { BubbleGraph } from "@liexp/ui/components/Common/Graph/BubbleGraph";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useKeywordsDistributionQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { ParentSize } from "@vx/responsive";
import * as React from "react";
import { queryToHash } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";

const KeywordsDistributionGraphComponent: React.FC<{ data: any[] }> = ({
  data,
}) => {
  const navigateTo = useNavigateToResource();
  return (
    <ParentSize style={{ height: 600 }}>
      {({ width, height }) => (
        <>
          <BubbleGraph
            variant="text"
            width={width}
            height={height}
            data={data.map((d) => ({
              ...d,
              count: d.events ?? 0,
              label: d.tag,
              color: d.color,
            }))}
            onClick={(d) => {
              navigateTo.events(
                {},
                { hash: queryToHash({ keywords: [d.id] }) }
              );
            }}
          />
        </>
      )}
    </ParentSize>
  );
};

const KeywordsDistributionGraph: React.FC = () => {
  return (
    <QueriesRenderer
      queries={{
        keywordDistribution: useKeywordsDistributionQuery({
          _start: 0,
          _end: 50,
        }),
      }}
      render={({ keywordDistribution }) => {
        return (
          <KeywordsDistributionGraphComponent data={keywordDistribution.data} />
        );
      }}
    />
  );
};

export default KeywordsDistributionGraph;
