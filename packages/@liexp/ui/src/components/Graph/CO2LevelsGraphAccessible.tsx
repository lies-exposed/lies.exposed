import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type GraphId } from "@liexp/io/lib/http/graphs/Graph.js";
import { LinearGradient } from "@visx/gradient";
import { ParentSize } from "@visx/responsive";
import { Schema } from "effect";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { AxisGraph } from "../Common/Graph/AxisGraph.js";
import QueriesRenderer from "../QueriesRenderer.js";
import { Checkbox } from "../mui/index.js";
import {
  GraphA11yWrapper,
  createAccessibleDataTable,
  generateDataDescription,
} from "./Accessibility/index.js";

const CO2LevelDatum = Schema.Struct({
  value: Schema.Number,
  year: Schema.Number,
}).annotations({
  title: "CO2LEvelDatum",
});

type CO2LevelDatum = typeof CO2LevelDatum.Type;

export interface CO2LevelsGraphAccessibleProps {
  showPoints: boolean;
  showGrid?: boolean;
  style?: React.CSSProperties;
}

type ToggleKey = "last-2000-years" | "last-800k-years";

const localiseToggleKey: Record<ToggleKey, string> = {
  "last-2000-years": "Last 2000 years",
  "last-800k-years": "Last 800k years",
};

interface State {
  toggleData: ToggleKey;
}

const initialState: State = {
  toggleData: "last-2000-years",
};

/**
 * CO2LevelsGraph with WCAG 2.1 AA accessibility support
 *
 * Features:
 * - ARIA labels and descriptions for both time periods
 * - Screen reader accessible data table
 * - Keyboard control for toggle between datasets
 * - High contrast gradients
 * - Focus indicators for interactive elements
 */
export const CO2LevelsGraphAccessible: React.FC<
  CO2LevelsGraphAccessibleProps
> = (props) => {
  const Queries = useEndpointQueries();
  const { showPoints, showGrid = true, style } = props;

  const [{ toggleData }, setToggleData] = React.useState(initialState);
  const id: GraphId =
    toggleData === "last-2000-years"
      ? "climate-change/forecast.csv"
      : "climate-change/history-of-climate-summits.csv";

  return (
    <QueriesRenderer
      queries={{ data: Queries.Graph.get.useQuery({ id: id as UUID }) }}
      render={({ data: { data } }) => {
        const processedData =
          toggleData === "last-2000-years"
            ? data.data.map(
                (d: { year: number; data_mean_global: number }) => ({
                  year: d.year,
                  value: d.data_mean_global,
                }),
              )
            : data.data;

        const values = processedData.map((d: CO2LevelDatum) => d.value);
        const description = generateDataDescription(
          values,
          `CO2 concentration (${toggleData === "last-2000-years" ? "last 2000 years" : "last 800,000 years"})`,
        );

        const dataTableHTML = createAccessibleDataTable(processedData, [
          {
            name: "Year",
            accessor: (d: CO2LevelDatum) => d.year.toString(),
          },
          {
            name: "CO2 (ppm)",
            accessor: (d: CO2LevelDatum) => d.value.toFixed(2),
          },
        ]);

        return (
          <GraphA11yWrapper
            id={`co2-levels-${toggleData}`}
            title={`CO2 Atmospheric Levels - ${localiseToggleKey[toggleData]}`}
            description={description}
            dataTable={
              <div dangerouslySetInnerHTML={{ __html: dataTableHTML }} />
            }
          >
            <ParentSize
              style={{ height: 400, width: "100%", ...style }}
              debounceTime={30}
            >
              {({ width, height }) => (
                <div style={{ height, width }}>
                  <AxisGraph<CO2LevelDatum>
                    id="co2-levels"
                    width={width}
                    height={height - 50}
                    margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
                    linePathElement={(id: string) => (
                      <LinearGradient
                        id={id}
                        vertical={true}
                        fromOpacity={1}
                        toOpacity={1}
                        to="#fcc317"
                        from="#fc2317"
                        fromOffset="40%"
                        toOffset="80%"
                      />
                    )}
                    background={(id: string) => (
                      <LinearGradient
                        id={id}
                        vertical={true}
                        from={"#de8cf3"}
                        to={"#177ffc"}
                        fromOpacity={1}
                        toOpacity={0.5}
                      />
                    )}
                    showPoints={showPoints}
                    showGrid={showGrid}
                    data={processedData}
                    minYRange={toggleData === "last-2000-years" ? 240 : 150}
                    getX={(d) => d.year}
                    getY={(d) => d.value}
                    axisLeftLabel={"CO2 concentration (part per million)"}
                    axisRightLabel={"CO2 concentration (part per million)"}
                    axisBottomLabel={"Date"}
                  />

                  {/* Accessible toggle controls */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    <label
                      htmlFor="co2-toggle"
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                      }}
                    >
                      {localiseToggleKey[toggleData]}
                    </label>
                    <Checkbox
                      id="co2-toggle"
                      checked={toggleData === "last-2000-years"}
                      onChange={() => {
                        setToggleData({
                          toggleData:
                            toggleData === "last-2000-years"
                              ? "last-800k-years"
                              : "last-2000-years",
                        });
                      }}
                      inputProps={{
                        "aria-label":
                          "Toggle between last 2000 years and last 800,000 years",
                      }}
                    />
                  </div>
                </div>
              )}
            </ParentSize>
          </GraphA11yWrapper>
        );
      }}
    />
  );
};
