import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import { type ScaleOrdinal } from "d3-scale";
import * as React from "react";

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
}): React.JSX.Element {
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
          padding: 10px 10px;
          float: left;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          margin: 5px 5px;
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
                      margin="0 5px"
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
                      <LegendLabel align="left" margin="0 0 0 4px">
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
                padding: 24px 24px 24px 32px;
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
