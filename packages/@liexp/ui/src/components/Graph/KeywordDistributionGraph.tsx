import { Keyword } from "@liexp/shared/io/http";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { scaleLog } from "@visx/scale";
import { Text } from "@visx/text";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";
import * as React from "react";
import { useKeywordsDistributionQuery } from "../../state/queries/DiscreteQueries";
import QueriesRenderer from "../QueriesRenderer";

export interface KeywordsDistributionGraphProps {
  data: any[];
  onClick: (k: Keyword.Keyword) => void;
}

const KeywordsDistributionGraphComponent: React.FC<
  KeywordsDistributionGraphProps
> = ({ data, onClick }) => {
  // const navigateTo = useNavigateToResource();

  const words = data.map(d => ({
    ...d,
    text: d.tag,
    value: d.events
  }));

  const wordsValue = words.map(w => w.value);

  const fontScale = scaleLog({
    domain: [
      Math.min(...wordsValue),
      Math.max(...wordsValue),
    ],
    range: [0, 100],
  });
  const fontSizeSetter = (datum: any) => fontScale(datum.value);

  return (
    <ParentSize style={{ height: 600 }}>
      {({ width, height }) => (
        <Wordcloud
          words={words}
          width={width}
          height={height}
          fontSize={fontSizeSetter}
          padding={2}
          spiral={"archimedean"}
          rotate={0}
          random={() => 0.5}
        >
          {(cloudWords) =>
            cloudWords.map((w: any, i) => {
              return (
                <Text
                  key={w.text}
                  fill={`#000`}
                  textAnchor={"middle"}
                  transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                  fontSize={w.size}
                  fontFamily={w.font}
                >
                  {w.text}
                </Text>
              );
            })
          }
        </Wordcloud>
      )}
    </ParentSize>
  );
};

const KeywordsDistributionGraph: React.FC<
  Pick<KeywordsDistributionGraphProps, "onClick">
> = (props) => {
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
          <KeywordsDistributionGraphComponent
            {...props}
            data={keywordDistribution.data}
          />
        );
      }}
    />
  );
};

export default KeywordsDistributionGraph;
