import { type GraphId } from "@liexp/shared/lib/io/http/graphs/Graph.js";
import { LinearGradient } from "@visx/gradient";
import { ParentSize } from "@visx/responsive";
import * as t from "io-ts";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { AxisGraph } from "../Common/Graph/AxisGraph.js";
import QueriesRenderer from "../QueriesRenderer.js";
import { Checkbox } from "../mui/index.js";

/**
 * CO2.Earth Data set: https://www.co2.earth/historical-co2-datasets
 * EPA - Climate Change Indicators: https://www.epa.gov/climate-indicators/climate-change-indicators-atmospheric-concentrations-greenhouse-gases
 */

// const CO2EarthDataEntry = t.type(
//   {
//     datenum: t.number,
//     year: t.number,
//     month: t.number,
//     day: t.number,
//     datetime: t.string,
//     data_mean_global: t.number,
//     data_mean_nh: t.number,
//     data_mean_sh: t.number,
//   },
//   "CO2EarthDataEntry"
// )

// type CO2EarthDataEntry = t.TypeOf<typeof CO2EarthDataEntry>

// const EPAIceCoreMeasurement = t.type(
//   {
//     // Year (negative values = BC),
//     year: t.number,
//     // "EPICA Dome C and  Vostok Station,  Antarctica",
//     value: t.number,
//     // // "Law Dome, Antarctica (75-year smoothed)"
//     // field3: t.string,
//     // // "Siple Station, Antarctica"
//     // field4: t.string,
//     // // "Mauna Loa, Hawaii",
//     // field5: t.string,
//     // // "Barrow, Alaska"
//     // field6: t.string,
//     // // "Cape Matatula,  American Samoa"
//     // field7: t.string,
//     // // "South Pole, Antarctica",
//     // field8: t.string,
//     // // "Cape Grim, Australia",
//     // field9: t.string,
//     // // "Lampedusa Island, Italy",
//     // field10: t.string,
//     // // "Shetland Islands, Scotland"
//     // field11: t.string,
//   },
//   "EPAIceCoreMeasurement"
// )

// type EPAIceCoreMeasurement = t.TypeOf<typeof EPAIceCoreMeasurement>

const CO2LevelDatum = t.type(
  {
    value: t.number,
    year: t.number,
  },
  "CO2LEvelDatum",
);

type CO2LevelDatum = t.TypeOf<typeof CO2LevelDatum>;

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
  const Queries = useEndpointQueries();
  const { showPoints, showGrid = true, style } = props;

  const [{ toggleData }, setToggleData] = React.useState(initialState);
  const id: GraphId =
    toggleData === "last-2000-years"
      ? "climate-change/forecast.csv"
      : "climate-change/history-of-climate-summits.csv";

  return (
    <QueriesRenderer
      queries={{ data: Queries.Graph.get.useQuery(undefined, { id }) }}
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
