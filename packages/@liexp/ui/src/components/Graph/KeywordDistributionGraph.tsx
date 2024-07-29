import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import { ParentSize } from "@visx/responsive";
import { scaleLog } from "@visx/scale";
import { Text } from "@visx/text";
import { Wordcloud } from "@visx/wordcloud";
import * as React from "react";
import QueriesRenderer from "../QueriesRenderer.js";

interface KeywordDatum extends Keyword.Keyword {
  text: string;
  events: number;
}

export interface KeywordsDistributionGraphProps {
  data: any[];
  onClick: (k: Keyword.Keyword) => void;
}

const KeywordsDistributionGraphComponent: React.FC<
  KeywordsDistributionGraphProps
> = ({ data, onClick }) => {
  const { words, minSize, maxSize } = React.useMemo(() => {
    const words = data
      .filter((d) => d.events > 0)
      .sort((a, b) => a.events - b.events)
      .map(
        (d): KeywordDatum => ({
          ...d,
          text: d.tag,
        }),
      );

    const wordSizes = words.map((w) => w.events);

    return {
      words,
      minSize: Math.min(...wordSizes),
      maxSize: Math.max(...wordSizes),
    };
  }, [data]);

  const fontScale = scaleLog({
    domain: [minSize, maxSize],
    range: [20, 100],
  });
  const fontSizeSetter = (datum: KeywordDatum): number => {
    const fontSize = fontScale(datum.events);
    const cappedFontsize = isNaN(fontSize) ? 0 : fontSize;
    return cappedFontsize;
  };

  return (
    <ParentSize style={{ height: 600, width: "100%" }}>
      {({ width, height }) => (
        <Wordcloud
          words={words}
          width={width}
          height={height}
          fontSize={fontSizeSetter}
          fontWeight={600}
          padding={2}
          spiral="archimedean"
          rotate={0}
          random={() => 0.5}
        >
          {(cloudWords) =>
            cloudWords.map((w: any, i) => {
              return (
                <Text
                  key={w.text}
                  fill={`#${w.color}`}
                  textAnchor={"middle"}
                  transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                  fontSize={w.size}
                  fontFamily={w.font}
                  fontWeight={600}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    onClick(w);
                  }}
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
  Pick<KeywordsDistributionGraphProps, "onClick"> & {
    count?: number;
  }
> = ({ count, ...props}) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        keywordDistribution: Q.Keyword.Custom.Distribution.useQuery(
          undefined,
          {
            _start: "0",
            _end: `${count}`,
          },
          false,
        ),
      })}
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
