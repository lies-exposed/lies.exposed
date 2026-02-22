import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import { type ScaleOrdinal } from "d3-scale";
import * as React from "react";
import {
  PADDING_MD,
  MARGIN_MD,
  MARGIN_LEFT_SM,
  PADDING_LG,
} from "../../../theme/styleUtils.js";

interface LegendsProps {
  title: string;
  scales: {
    title: string;
    scale: ScaleOrdinal<string, string>;
    shape: "circle" | "rect";
  }[];
}

function LegendDemo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="legend">
      <div className="title">{title}</div>
      {children}
      <style>{`
        .legend {
          line-height: 0.9em;
          color: #efefef;
          font-size: 10px;
          font-family: arial;
          padding: ${PADDING_MD};
          float: left;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          margin: ${MARGIN_MD};
        }
        .title {
          font-size: 12px;
          margin-bottom: 10px;
          font-weight: 100;
        }
      `}</style>
    </div>
  );
}

export const Legends: React.FC<LegendsProps> = (props) => {
  return (
    <div className="legends">
      {props.scales.map((s) => (
        <LegendDemo key={s.title} title={s.title}>
          <LegendOrdinal scale={s.scale} labelFormat={(datum) => datum}>
            {(labels) => {
              return (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {labels.map((label, i) => (
                    <LegendItem
                      key={`legend-quantile-${i}`}
                      margin={MARGIN_LEFT_SM}
                      onClick={() => {}}
                    >
                      <svg width={10} height={10}>
                        {s.shape === "circle" ? (
                          <circle
                            fill={`#${label.value}`}
                            r={4}
                            cy={4}
                            cx={4}
                          />
                        ) : (
                          <rect
                            fill={`#${label.value}`}
                            width={10}
                            height={2}
                          />
                        )}
                      </svg>
                      <LegendLabel align="left" margin={MARGIN_LEFT_SM}>
                        {label.text}
                      </LegendLabel>
                    </LegendItem>
                  ))}
                </div>
              );
            }}
          </LegendOrdinal>
        </LegendDemo>
      ))}
      <style>{`
              .legends {
                font-family: arial;
                font-weight: 900;
                border-radius: 14px;
                padding: ${PADDING_LG};
                overflow-y: auto;
                flex-grow: 1;
                color: black;
              }
              .chart h2 {
                margin-left: 10px;
              }
            `}</style>
    </div>
  );
};
