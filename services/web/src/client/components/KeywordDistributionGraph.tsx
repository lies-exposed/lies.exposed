import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { BubbleGraph } from "@liexp/ui/components/Common/Graph/BubbleGraph";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { ParentSize } from "@vx/responsive";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";

const KeywordsDistributionGraphComponent: React.FC<{ data: any[] }> = ({
  data,
}) => {
  console.log(data);
  return (
    <ParentSize style={{ height: 400 }}>
      {({ width, height }) => (
        <>
          <BubbleGraph
            variant="text"
            width={width}
            height={height}
            data={data.map((d) => ({
              count: d.events ?? 0,
              label: d.tag,
              color: d.color,
            }))}
            onClick={() => {}}
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
          console.log("keywords", keywordDistribution);
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
