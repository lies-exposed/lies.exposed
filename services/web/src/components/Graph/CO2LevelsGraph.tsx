import { AxisGraph } from "@components/Common/Graph/AxisGraph"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { LinearGradient } from "@vx/gradient"
import ParentSize from "@vx/responsive/lib/components/ParentSize"
import { Block } from "baseui/block"
import { Checkbox, STYLE_TYPE, LABEL_PLACEMENT } from "baseui/checkbox"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import * as React from "react"

/**
 * CO2.Earth Data set: https://www.co2.earth/historical-co2-datasets
 * EPA - Climate Change Indicators: https://www.epa.gov/climate-indicators/climate-change-indicators-atmospheric-concentrations-greenhouse-gases
 */

const CO2EarthDataEntry = t.type(
  {
    datenum: t.number,
    year: t.number,
    month: t.number,
    day: t.number,
    datetime: t.string,
    data_mean_global: t.number,
    data_mean_nh: t.number,
    data_mean_sh: t.number,
  },
  "CO2EarthDataEntry"
)

type CO2EarthDataEntry = t.TypeOf<typeof CO2EarthDataEntry>

const EPAIceCoreMeasurement = t.type(
  {
    // Year (negative values = BC),
    year: t.number,
    // "EPICA Dome C and  Vostok Station,  Antarctica",
    value: t.number,
    // // "Law Dome, Antarctica (75-year smoothed)"
    // field3: t.string,
    // // "Siple Station, Antarctica"
    // field4: t.string,
    // // "Mauna Loa, Hawaii",
    // field5: t.string,
    // // "Barrow, Alaska"
    // field6: t.string,
    // // "Cape Matatula,  American Samoa"
    // field7: t.string,
    // // "South Pole, Antarctica",
    // field8: t.string,
    // // "Cape Grim, Australia",
    // field9: t.string,
    // // "Lampedusa Island, Italy",
    // field10: t.string,
    // // "Shetland Islands, Scotland"
    // field11: t.string,
  },
  "EPAIceCoreMeasurement"
)

type EPAIceCoreMeasurement = t.TypeOf<typeof EPAIceCoreMeasurement>

const CO2LevelDatum = t.type(
  {
    value: t.number,
    year: t.number,
  },
  "CO2LEvelDatum"
)

type CO2LevelDatum = t.TypeOf<typeof CO2LevelDatum>

export interface CO2LevelsGraphProps {
  showPoints: boolean
  showGrid?: boolean
  style?: React.CSSProperties
}

type ToggleKey = "last-2000-years" | "last-800k-years"

const localiseToggleKey: Record<ToggleKey, string> = {
  "last-2000-years": "Last 2000 years",
  "last-800k-years": "Last 800k years",
}

export const CO2LevelsGraph: React.FC<CO2LevelsGraphProps> = ({
  showPoints,
  showGrid = true,
  style,
}) => {
  const [data, setData] = React.useState({
    CO2Earth: [],
    EPA: [],
    loaded: false,
  })
  const [toggleData, setToggleData] = React.useState<ToggleKey>(
    "last-800k-years"
  )

  React.useEffect(() => {
    if (!data.loaded) {
      setData({
        CO2Earth: require("../../../static/data/co2_ppm_earth_data.json"),
        EPA: require("../../../static/data/ghg-concentrations_800k-hundred-years-aggregated.json"),
        loaded: true,
      })
    }
  }, [])

  return pipe(
    sequenceS(E.either)({
      CO2EarthData: t.array(CO2EarthDataEntry).decode(data.CO2Earth),
      EPAData: t.array(EPAIceCoreMeasurement).decode(data.EPA),
    }),
    E.map(({ CO2EarthData, EPAData }) => {
      if (toggleData === "last-2000-years") {
        return CO2EarthData.map((d) => ({
          year: d.year,
          value: d.data_mean_global,
        }))
      }
      return EPAData
    }),
    E.fold(throwValidationErrors, (data) => (
      <ParentSize
        style={{ height: 400, width: "100%", ...style }}
        debounceTime={30}
      >
        {({ width, height }) => (
          <Block overrides={{ Block: { style: { height } } }} margin={0}>
            <AxisGraph<CO2LevelDatum>
              id="co2-levels"
              width={width}
              height={height - 50}
              margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
              linePathElement={(id) => (
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
              background={(id) => (
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
              data={data}
              minYRange={toggleData === "last-2000-years" ? 240 : 150}
              getX={(d) => d.year}
              getY={(d) => d.value}
              axisLeftLabel={"CO2 cocentration (part per million)"}
              axisRightLabel={"CO2 cocentration (part per million)"}
              axisBottomLabel={"Date"}
            />

            <Checkbox
              overrides={{
                Root: {
                  style: {
                    display: "flex",
                    justifyContent: "center",
                  },
                },
              }}
              checkmarkType={STYLE_TYPE.toggle_round}
              labelPlacement={LABEL_PLACEMENT.right}
              checked={toggleData === "last-2000-years"}
              onChange={() => {
                setToggleData(
                  toggleData === "last-2000-years"
                    ? "last-800k-years"
                    : "last-2000-years"
                )
              }}
            >
              {localiseToggleKey[toggleData]}
            </Checkbox>
          </Block>
        )}
      </ParentSize>
    ))
  )
}
