import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { BubbleGraph } from "@liexp/ui/components/Common/Graph/BubbleGraph";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { ParentSize } from "@vx/responsive";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { queryToHash, useNavigateTo } from "../utils/history.utils";
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
    <WithQueries
      queries={{ keywordDistribution: Queries.Keyword.Custom.Distribution }}
      params={{
        keywordDistribution: {
          Query: {
            _start: "0",
            _stop: "50",
          },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ keywordDistribution }) => {
          return (
            <KeywordsDistributionGraphComponent
              data={keywordDistribution.data}
            />
          );
        }
      )}
    />
  );
};

export default KeywordsDistributionGraph;
