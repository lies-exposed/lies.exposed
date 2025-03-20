import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type GraphId } from "@liexp/shared/lib/io/http/graphs/Graph.js";
import { LinearGradient } from "@visx/gradient";
import { ParentSize } from "@visx/responsive";
import { Schema } from "effect";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { AxisGraph } from "../Common/Graph/AxisGraph.js";
import QueriesRenderer from "../QueriesRenderer.js";
import { Checkbox } from "../mui/index.js";

/**
 * CO2.Earth Data set: https://www.co2.earth/historical-co2-datasets
 * EPA - Climate Change Indicators: https://www.epa.gov/climate-indicators/climate-change-indicators-atmospheric-concentrations-greenhouse-gases
 */

// const CO2EarthDataEntry = Schema.Struct(
//   {
//     datenum: Schema.Number,
//     year: Schema.Number,
//     month: Schema.Number,
//     day: Schema.Number,
//     datetime: Schema.String,
//     data_mean_global: Schema.Number,
//     data_mean_nh: Schema.Number,
//     data_mean_sh: Schema.Number,
//   },
//   "CO2EarthDataEntry"
// )

// type CO2EarthDataEntry = t.TypeOf<typeof CO2EarthDataEntry>

// const EPAIceCoreMeasurement = Schema.Struct(
//   {
//     // Year (negative values = BC),
//     year: Schema.Number,
//     // "EPICA Dome C and  Vostok Station,  Antarctica",
//     value: Schema.Number,
//     // // "Law Dome, Antarctica (75-year smoothed)"
//     // field3: Schema.String,
//     // // "Siple Station, Antarctica"
//     // field4: Schema.String,
//     // // "Mauna Loa, Hawaii",
//     // field5: Schema.String,
//     // // "Barrow, Alaska"
//     // field6: Schema.String,
//     // // "Cape Matatula,  American Samoa"
//     // field7: Schema.String,
//     // // "South Pole, Antarctica",
//     // field8: Schema.String,
//     // // "Cape Grim, Australia",
//     // field9: Schema.String,
//     // // "Lampedusa Island, Italy",
//     // field10: Schema.String,
//     // // "Shetland Islands, Scotland"
//     // field11: Schema.String,
//   },
//   "EPAIceCoreMeasurement"
// )

// type EPAIceCoreMeasurement = t.TypeOf<typeof EPAIceCoreMeasurement>

const CO2LevelDatum = Schema.Struct({
  value: Schema.Number,
  year: Schema.Number,
}).annotations({
  title: "CO2LEvelDatum",
});

type CO2LevelDatum = typeof CO2LevelDatum.Type;

export interface CO2LevelsGraphProps {
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
export const CO2LevelsGraph: React.FC<CO2LevelsGraphProps> = (props) => {
  const { Queries } = useEndpointQueries();
  const { showPoints, showGrid = true, style } = props;

  const [{ toggleData }, setToggleData] = React.useState(initialState);
  const id: GraphId =
    toggleData === "last-2000-years"
      ? "climate-change/forecast.csv"
      : "climate-change/history-of-climate-summits.csv";

  return (
    <QueriesRenderer
      queries={{ data: Queries.Graph.get.useQuery({ id: id as UUID }) }}
      render={({ data }) => (
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
                data={
                  toggleData === "last-2000-years"
                    ? data.data.map((d: any) => ({
                        year: d.year,
                        value: d.data_mean_global,
                      }))
                    : data.data
                }
                minYRange={toggleData === "last-2000-years" ? 240 : 150}
                getX={(d) => d.year}
                getY={(d) => d.value}
                axisLeftLabel={"CO2 cocentration (part per million)"}
                axisRightLabel={"CO2 cocentration (part per million)"}
                axisBottomLabel={"Date"}
              />

              {localiseToggleKey[toggleData]}
              <Checkbox
                checked={toggleData === "last-2000-years"}
                onChange={() => {
                  setToggleData({
                    toggleData:
                      toggleData === "last-2000-years"
                        ? "last-800k-years"
                        : "last-2000-years",
                  });
                }}
              />
            </div>
          )}
        </ParentSize>
      )}
    />
  );
};
