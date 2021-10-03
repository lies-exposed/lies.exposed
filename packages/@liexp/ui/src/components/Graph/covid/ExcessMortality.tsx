import { COVID19ExcessMortalityDatum } from "@liexp/shared/io/http/covid/COVID19ExcessMortalityDatum";
import {
  AgeGroup,
  EighteenToSixtyFourYears,
  MoreThanEightyFiveYears,
  NotSpecified,
  SixtyFiveToEightyfiveYears,
  ThreeToTwelveYears,
  TwelveToSixteenYears,
  TwoMonthsToTwoYears,
  ZeroToOneMonth
} from "@liexp/shared/io/http/covid/VaccineDatum";
import { VaccineDistributionDatum } from "@liexp/shared/io/http/covid/VaccineDistributionDatum";
import { AxisBottom, AxisLeft, AxisRight } from "@vx/axis";
import { curveLinear } from "@vx/curve";
import { localPoint } from "@vx/event";
import { LinearGradient } from "@vx/gradient";
import { Group } from "@vx/group";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleLinear, scaleTime } from "@vx/scale";
import { Bar, LinePath } from "@vx/shape";
import { Accessor } from "@vx/shape/lib/types";
import { TooltipWithBounds, withTooltip } from "@vx/tooltip";
import { formatISO, isDate } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {  useJSONDataQuery } from "../../../state/queries/DiscreteQueries";
import * as t from 'io-ts';
import QueriesRenderer from "../../QueriesRenderer";
import { Box, Grid, Typography, TypographyProps } from "../../mui";
import { CovidWHOWorldData } from '@liexp/shared/endpoints/graph.endpoints';

const ageGroupColors = {
  all: "#b623ad",
  [NotSpecified.value]: "#6b707a",
  [ZeroToOneMonth.value]: "#886398",
  [TwoMonthsToTwoYears.value]: "#58ef28",
  [ThreeToTwelveYears.value]: "#65c3b9",
  [TwelveToSixteenYears.value]: "#cd23d9",
  [EighteenToSixtyFourYears.value]: "#83db7e",
  [SixtyFiveToEightyfiveYears.value]: "#c0cbcf",
  [EighteenToSixtyFourYears.value]: "#4f7185",
  [MoreThanEightyFiveYears.value]: "#5175dc",
};

const getReportX: Accessor<COVID19ExcessMortalityDatum, Date> = (d) => {
  return d.date;
};

const getReportY: Accessor<COVID19ExcessMortalityDatum, number> = (d) => {
  return pipe(
    d.cum_excess_proj_all_ages,
    O.getOrElse(() => 0)
  );
};

const getDistributionX: Accessor<VaccineDistributionDatum, Date> = (d) => {
  return d.date;
};

const getDistributionY: Accessor<VaccineDistributionDatum, number> = (d) => {
  return d.people_vaccinated;
};

const toMillion = (n: number): number => {
  return n / 10e5;
};

const backgroundId = "vaccines-graph-background";
// const vaersLineId = "vaers-vaccines-line";
const eudrvigilanceLineId = "eudrvigilance-vaccines-line";

// distribution
const europeVaccineDistributionFirstDoseLineId =
  "europe-vaccine-distribution-first-dose-line";
const europeVaccineDistributionSecondDoseLineId =
  "europe-vaccine-distribution-second-dose-line";

const getDatumTableData = (
  v: COVID19ExcessMortalityDatum
): Array<[string, string, number]> => {
  return [v.p_proj_0_14, v.p_proj_15_64, v.p_proj_all_ages].map((v, i) => {
    const result = pipe(
      v,
      O.map((s) => (typeof s === "string" ? parseInt(s, 10) : s)),
      O.getOrElse(() => 0)
    );
    return ["", "", result];
  });
};

interface ExcessMortalityDatumTableProps {
  data: Array<[string, string, number]>;
  labelVariant?: TypographyProps["variant"];
  valueVariant?: TypographyProps["variant"];
}
const ExcessMortalityDatumTable: React.FC<ExcessMortalityDatumTableProps> = ({
  data,
  labelVariant = "body2",
  valueVariant = "h4",
}) => {
  return (
    <Box display="flex" flexDirection="column" width="100%">
      {data.map(([label, color, value]) => (
        <Box
          key={label}
          display="flex"
          width="100%"
          style={{ marginBottom: 10 }}
        >
          <Box
            display="flex"
            flexGrow={2}
            flexBasis="100%"
            alignItems="flex-end"
          >
            <Typography
              variant={labelVariant}
              display="inline"
              style={{
                color,
              }}
            >
              {label}
            </Typography>
          </Box>
          <Box display="flex">
            <Typography
              variant={valueVariant}
              display="inline"
              style={{
                margin: 0,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const renderTooltip = (data: COVID19ExcessMortalityDatum): JSX.Element => {
  return (
    <ExcessMortalityDatumTable
      labelVariant="caption"
      valueVariant="body2"
      data={getDatumTableData(data)}
    />
  );
};

interface ExcessMortalityGraphComponentProps {
  width: number;
  height: number;
  data: COVID19ExcessMortalityDatum[];
  distribution: VaccineDistributionDatum[];
  ageGroup?: AgeGroup;
}

const ExcessMortalityGraphComponent = withTooltip<
  ExcessMortalityGraphComponentProps,
  COVID19ExcessMortalityDatum
>((props) => {
  const {
    height = 500,
    width,
    data,
    distribution,
    tooltipOpen,
    tooltipData,
    tooltipTop,
    tooltipLeft,
    showTooltip,
    hideTooltip,
    updateTooltip,
  } = props;

  const margin = {
    top: 80,
    right: 80,
    bottom: 80,
    left: 80,
  };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const minDate =
    data[0].date.getTime() >= distribution[0].date.getTime()
      ? distribution[0].date
      : data[0].date;

  const xScaleDomain = [minDate, new Date()];
  const xScale = scaleTime<Date>({
    domain: xScaleDomain,
  });

  const yScaleMax = Math.max(
    ...data.map((d) => O.getOrElse(() => 0)(d.cum_excess_proj_all_ages))
  );

  const yScaleDomain = [0, yScaleMax];

  const yLeftScale = scaleLinear<number>({
    domain: yScaleDomain,
  });

  const xScaleMax = Math.max(0, 1);

  const yRightScaleDomain = [0, xScaleMax];

  const yRightScale = scaleLinear<number>({
    domain: yRightScaleDomain,
  });

  xScale.rangeRound([0, xMax]);
  yLeftScale.rangeRound([yMax, 0]);
  yRightScale.rangeRound([yMax, 0]);

  const handleTooltip = React.useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
    ) => {
      const { x } = localPoint(event) ?? { x: 0 };
      const x0 = xScale.invert(x);

      const d = data.find(
        (d) =>
          formatISO(d.date, { representation: "date" }) ===
          formatISO(x0, { representation: "date" })
      );
      if (d) {
        if (tooltipOpen) {
          updateTooltip({
            tooltipOpen: true,
            tooltipData: d,
            tooltipLeft: x,
            tooltipTop: yLeftScale(getReportY(d)),
          });
        } else {
          showTooltip({
            tooltipData: d,
            tooltipLeft: x,
            tooltipTop: yLeftScale(getReportY(d)),
          });
        }
      }
    },
    [showTooltip, yLeftScale, xScale]
  );

  return (
    <React.Fragment>
      <div style={{ position: "relative", width }}>
        <svg width={width} height={height}>
          {/** EUDRVIGILANCE */}
          <LinearGradient
            id={eudrvigilanceLineId}
            vertical={true}
            fromOpacity={1}
            toOpacity={1}
            to={ageGroupColors.all}
            from={ageGroupColors.all}
            fromOffset="40%"
            toOffset="80%"
          />
          {/** VACCINE DISTRIBUTION - First dose */}
          <LinearGradient
            id={europeVaccineDistributionFirstDoseLineId}
            vertical={true}
            fromOpacity={1}
            toOpacity={1}
            to="#67be2a"
            from="#67be2a"
            fromOffset="40%"
            toOffset="80%"
          />
          <LinearGradient
            id={europeVaccineDistributionSecondDoseLineId}
            vertical={true}
            fromOpacity={1}
            toOpacity={1}
            to="#67be65"
            from="#67be65"
            fromOffset="40%"
            toOffset="80%"
          />
          {/** And are then referenced for a style attribute. */}
          <Group top={margin.top} left={margin.left}>
            <LinePath
              data={distribution}
              x={(d) => xScale(getDistributionX(d))?.valueOf() ?? 0}
              y={(d) => yRightScale(getDistributionY(d)) ?? 0}
              stroke={`url('#${europeVaccineDistributionFirstDoseLineId}')`}
              strokeWidth={2}
              curve={curveLinear}
              shapeRendering="geometricPrecision"
            />
            <LinePath
              data={data}
              x={(d) => {
                const x = xScale(getReportX(d))?.valueOf() ?? 0;
                return x;
              }}
              y={(d) => yLeftScale(getReportY(d)) ?? 0}
              stroke={`url('#${eudrvigilanceLineId}')`}
              strokeWidth={2}
              shapeRendering="geometricPrecision"
              curve={curveLinear}
            />
            <AxisLeft
              scale={yLeftScale}
              label="Deaths (millions)"
              tickFormat={(d) => toMillion(d.valueOf()).toFixed(3).toString()}
            />
            <AxisRight
              scale={yRightScale}
              left={xMax}
              label="Vaccine Distribution (million)"
              tickFormat={(d) => toMillion(d.valueOf()).toString()}
            />
            <AxisBottom
              top={yMax}
              scale={xScale}
              label="Date"
              tickFormat={(d) => {
                if (isDate(d)) {
                  return formatISO(d as any, { representation: "date" });
                }
                return d.valueOf().toString();
              }}
            />
          </Group>
          <Bar
            fill={`url(#${backgroundId})`}
            x={0}
            y={0}
            width={width}
            height={500}
            stroke="transparent"
            strokeWidth={0}
            rx={0}
            onMouseEnter={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
            onMouseOut={() => hideTooltip()}
          />
        </svg>
        {tooltipOpen && tooltipData ? (
          <TooltipWithBounds
            width={300}
            height={100}
            top={(tooltipTop ?? 100) - 100}
            left={tooltipLeft}
          >
            {renderTooltip(tooltipData)}
          </TooltipWithBounds>
        ) : null}
      </div>
    </React.Fragment>
  );
});

interface ExcessMortalityGraphProps {
  id: string;
  style?: React.CSSProperties
}

export const ExcessMortalityGraph: React.FC<ExcessMortalityGraphProps> = ({ id, ...props}) => {
  return (
    <QueriesRenderer
      queries={{
        distribution: useJSONDataQuery(
          t.strict({ data: CovidWHOWorldData.types[1] }).decode,
          id
        ),
      }}
      render={({ distribution }) => {
        return (
          <div {...props}>
            <Grid container spacing={3}>
              <Grid container spacing={2}>
                <Grid item md={10}>
                  <Grid container spacing={2}>
                    <Grid item md={12}>
                      <ParentSize style={{ width: "100%" }}>
                        {({ width }) => {
                          return (
                            <ExcessMortalityGraphComponent
                              width={width}
                              height={500}
                              data={[]}
                              distribution={distribution}
                            />
                          );
                        }}
                      </ParentSize>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        );
      }}
    />
  );
};
