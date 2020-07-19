import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql } from "gatsby"
import * as t from "io-ts"
import { NumberFromString } from "io-ts-types/lib/NumberFromString"
import * as React from "react"
import { Axis } from "./graph/Axis"
/**
 * CO2.Earth Data set: https://www.co2.earth/historical-co2-datasets
 * EPA - Climate Change Indicators: https://www.epa.gov/climate-indicators/climate-change-indicators-atmospheric-concentrations-greenhouse-gases
 */

interface HumanPopulationGrowthGraphProps {
  width: number
  height: number
}

const CO2EarthDataEntry = t.type(
  {
    datenum: NumberFromString,
    year: NumberFromString,
    month: NumberFromString,
    day: NumberFromString,
    datetime: t.string,
    data_mean_global: NumberFromString,
    data_mean_nh: NumberFromString,
    data_mean_sh: NumberFromString,
  },
  "CO2EarthDataEntry"
)

type CO2EarthDataEntry = t.TypeOf<typeof CO2EarthDataEntry>

const EPAIceCoreMeasurement = t.type(
  {
    // Year (negative values = BC),
    field1: NumberFromString,
    // "EPICA Dome C and  Vostok Station,  Antarctica",
    field2: t.string,
    // "Law Dome, Antarctica (75-year smoothed)"
    field3: t.string,
    // "Siple Station, Antarctica"
    field4: t.string,
    // "Mauna Loa, Hawaii",
    field5: t.string,
    // "Barrow, Alaska"
    field6: t.string,
    // "Cape Matatula,  American Samoa"
    field7: t.string,
    // "South Pole, Antarctica",
    field8: t.string,
    // "Cape Grim, Australia",
    field9: t.string,
    // "Lampedusa Island, Italy",
    field10: t.string,
    // "Shetland Islands, Scotland"
    field11: t.string,
  },
  "EPAIceCoreMeasurement"
)

type EPAIceCoreMeasurement = t.TypeOf<typeof EPAIceCoreMeasurement>

interface QueryResults {
  CO2EarthData: { childCsvData: { csvData: CO2EarthDataEntry[] } }
  EPAData: { childCsvData: { csvData: EPAIceCoreMeasurement[] } }
}

const CO2LevelDatum = t.type(
  {
    value: t.number,
    year: t.number,
  },
  "CO2LEvelDatum"
)

type CO2LevelDatum = t.TypeOf<typeof CO2LevelDatum>

export const CO2LevelsGraph: React.FC<HumanPopulationGrowthGraphProps> = ({
  width,
  height,
}) => {
  const { CO2EarthData, EPAData }: QueryResults = useStaticQuery(graphql`
    query CO2LevelsGraph {
      CO2EarthData: file(
        name: { eq: "mole_fraction_of_carbon_dioxide_in_air" }
      ) {
        childCsvData {
          csvData {
            datenum
            year
            month
            day
            datetime
            data_mean_global
            data_mean_nh
            data_mean_sh
          }
        }
      }
      EPAData: file(name: { eq: "ghg-concentrations_800k-hundred-years" }) {
        childCsvData {
          csvData {
            field1
            field2
            field3
            field4
            field5
            field6
            field7
            field8
            field9
            field10
            field11
          }
        }
      }
    }
  `)

  return pipe(
    sequenceS(E.either)({
      CO2EarthData: t
        .array(CO2EarthDataEntry)
        .decode(CO2EarthData.childCsvData.csvData),
      EPAData: t
        .array(EPAIceCoreMeasurement)
        .decode(EPAData.childCsvData.csvData),
    }),
    E.map(({ CO2EarthData, EPAData }) => {
      const measurements = EPAData.map(d => ({
        year: d.field1,
        value: Math.max(
          ...[d.field2, d.field3, d.field4, d.field5, d.field6, d.field7]
            .filter(e => e !== "")
            .map(d => parseInt(d, 10))
        ),
      }))

      return measurements.concat(
        CO2EarthData.map(d => ({
          year: d.year,
          value: d.data_mean_global,
        }))
      )
    }),
    E.fold(throwValidationErrors, data => (
      <Axis<CO2LevelDatum>
        width={width}
        height={height}
        margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
        data={data}
        minY={150}
        getX={d => d.year}
        getY={d => d.value}
        axisLeftLabel={"CO2 cocentration (part per million)"}
        axisRightLabel={"CO2 cocentration (part per million)"}
        axisBottomLabel={"Date"}
      />
    ))
  )
}
