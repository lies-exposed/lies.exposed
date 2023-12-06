import {
  AgeGroup,
  EighteenToSixtyFourYears,
  Manufacturer,
  MoreThanEightyFiveYears,
  NotSpecified,
  SixtyFiveToEightyfiveYears,
  ThreeToTwelveYears,
  TwelveToSixteenYears,
  TwoMonthsToTwoYears,
  VaccineDatum,
  ZeroToOneMonth,
} from "@liexp/shared/lib/io/http/covid/VaccineDatum";
import { type VaccineDistributionDatum } from "@liexp/shared/lib/io/http/covid/VaccineDistributionDatum";
import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis";
import { curveLinear } from "@visx/curve";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { scaleLinear, scaleTime } from "@visx/scale";
import { Bar, LinePath } from "@visx/shape";
import { type Accessor } from "@visx/shape/lib/types";
import { TooltipWithBounds, withTooltip } from "@visx/tooltip";
import { isDate } from "date-fns";
import * as t from "io-ts";
import * as React from "react";
import { useJSONDataQuery } from "../../../../state/queries/DiscreteQueries";
import { styled } from "../../../../theme";
import { StatAccordion } from "../../../Common/StatAccordion";
import QueriesRenderer from "../../../QueriesRenderer";
import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  type TypographyProps,
  type SelectChangeEvent,
} from "../../../mui";

const PREFIX = "VaccineADRGraph";

const classes = {
  root: `${PREFIX}-root`,
  formControl: `${PREFIX}-formControl`,
  graphAccordionHeading: `${PREFIX}-graphAccordionHeading`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    width: "100%",
  },

  [`& .${classes.formControl}`]: {
    position: "relative",
    minWidth: 120,
    marginBottom: theme.spacing(2),
  },

  [`& .${classes.graphAccordionHeading}`]: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: theme.typography.fontWeightRegular as any,
  },
}));

const ageGroupColors = {
  all: "#b623ad",
  [NotSpecified.value]: "#6b707a",
  [ZeroToOneMonth.value]: "#886398",
  [TwoMonthsToTwoYears.value]: "#58ef28",
  [ThreeToTwelveYears.value]: "#65c3b9",
  [TwelveToSixteenYears.value]: "#cd23d9",
  [EighteenToSixtyFourYears.value]: "#83db7e",
  [SixtyFiveToEightyfiveYears.value]: "#c0cbcf",
  [MoreThanEightyFiveYears.value]: "#5175dc",
};

const getByAgeGroup =
  (map: Record<string, string>) =>
  (ag: AgeGroup | "all"): string => {
    const value = map[ag];
    if (value) {
      return value;
    }
    return "red";
  };

const getValueForAgeGroup = (v: VaccineDatum, ageGroup?: AgeGroup): number => {
  switch (ageGroup) {
    case "0-1-months":
      return v.total_death_0_1_month;
    case "2-months-2-years":
      return v.total_death_2_month_2_years;
    case "3-12-years":
      return v.total_death_3_11_years;
    case "12-17-years":
      return v.total_death_12_17_years;
    case "18-64-years":
      return v.total_death_18_64_years;
    case "65-85-years":
      return v.total_death_65_85_years;
    case "more-than-85-years":
      return v.total_death_more_than_85_years;
    default:
      return v.total_deaths;
  }
};

const getAgeGroupColor = getByAgeGroup(ageGroupColors);

const populationNumber = 8 * 10e8;

const getReportX: Accessor<VaccineDatum, Date> = (d) => {
  return d.date;
};

const MakeGetReportY: (
  ageGroup: AgeGroup | undefined,
  adrReportFactor: number,
) => Accessor<VaccineDatum, number> = (ageGroup, adrReportFactor) => (d) => {
  return getValueForAgeGroup(d, ageGroup) * adrReportFactor;
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
  v: VaccineDatum,
): Array<[string, string, number]> => {
  return [
    v.total_death_0_1_month,
    v.total_death_2_month_2_years,
    v.total_death_3_11_years,
    v.total_death_12_17_years,
    v.total_death_18_64_years,
    v.total_death_65_85_years,
    v.total_death_more_than_85_years,
    v.total_death_years_not_specified,
    v.total_deaths,
  ].map((v, i) => {
    const ageGroup = AgeGroup.types[i] ? AgeGroup.types[i].value : "all";
    const color = getAgeGroupColor(ageGroup);
    return [ageGroup, color, v];
  });
};

interface VaccineDatumTableProps {
  data: Array<[string, string, number]>;
  labelVariant?: TypographyProps["variant"];
  valueVariant?: TypographyProps["variant"];
}
const VaccineDatumTable: React.FC<VaccineDatumTableProps> = ({
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

const renderTooltip = (data: VaccineDatum): JSX.Element => {
  return (
    <VaccineDatumTable
      labelVariant="caption"
      valueVariant="body2"
      data={getDatumTableData(data)}
    />
  );
};

interface VaccineADRGraphComponentProps {
  width: number;
  height: number;
  data: VaccineDatum[];
  distribution: VaccineDistributionDatum[];
  adrReportFactor: number;
  ageGroup?: AgeGroup;
}

const VaccineADRGraphComponent = withTooltip<
  VaccineADRGraphComponentProps,
  VaccineDatum
>((props) => {
  const {
    height = 500,
    width,
    data,
    distribution,
    adrReportFactor,
    ageGroup,
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

  const getReportY = React.useMemo(
    () => MakeGetReportY(ageGroup, adrReportFactor),
    [ageGroup, adrReportFactor],
  );

  const currentTotalVaccinations =
    distribution[distribution.length - 1].people_vaccinated;
  const totalVaccinations = currentTotalVaccinations;
  const eudrTodayDatum = data[data.length - 1];

  const totalDeaths =
    getValueForAgeGroup(eudrTodayDatum, ageGroup) * adrReportFactor;

  const yScaleDomain = [0, totalDeaths];

  const yLeftScale = scaleLinear<number>({
    domain: yScaleDomain,
  });

  const yRightScaleDomain = [0, totalVaccinations];

  const yRightScale = scaleLinear<number>({
    domain: yRightScaleDomain,
  });

  xScale.rangeRound([0, xMax]);
  yLeftScale.rangeRound([yMax, 0]);
  yRightScale.rangeRound([yMax, 0]);

  const handleTooltip = React.useCallback(
    (
      event:
        | React.TouchEvent<SVGRectElement>
        | React.MouseEvent<SVGRectElement>,
    ) => {
      const { x } = localPoint(event) ?? { x: 0 };
      const x0 = xScale.invert(x);

      const d = data.find((d) => formatDate(d.date) === formatDate(x0));
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
    [showTooltip, yLeftScale, xScale],
  );

  return (
    <React.Fragment>
      <Root style={{ position: "relative", width }}>
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
                  return formatDate(d as any);
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
            onMouseLeave={() => {
              hideTooltip();
            }}
            onMouseOut={() => {
              hideTooltip();
            }}
          />
        </svg>
        {tooltipOpen && tooltipData ? (
          <TooltipWithBounds
            style={{
              width: 300,
              height: 100,
            }}
            top={(tooltipTop ?? 100) - 100}
            left={tooltipLeft}
          >
            {renderTooltip(tooltipData)}
          </TooltipWithBounds>
        ) : null}
      </Root>
    </React.Fragment>
  );
});

const MenuProps = {
  style: {
    maxWidth: 300,
    maxHeight: 300,
  },
};

const adrReportRate100 = 100;
const adrReportRate10 = 10;
const adrReportRate1 = 1;

interface VaccineADRGraphProps {
  id: string;
  distribution: VaccineDistributionDatum[];
}

export const VaccineADRGraph: React.FC<VaccineADRGraphProps> = ({
  id,
  distribution,
}) => {
  const [adrReportRate, setADRReportRate] = React.useState(adrReportRate100);
  const [manufacturer, setManufacturer] = React.useState("All");
  const [ageGroup, setAgeGroup] = React.useState("All" as any);

  const handleADRReportRateChange = React.useCallback(
    (event: SelectChangeEvent<number>): void => {
      setADRReportRate(
        typeof event.target.value === "string"
          ? parseInt(event.target.value, 10)
          : event.target.value,
      );
    },
    [],
  );

  const handleManufacturerChange = React.useCallback(
    (event: SelectChangeEvent<string>): void => {
      setManufacturer(event.target.value);
    },
    [],
  );

  const handlePatientAgeGroupChange = React.useCallback(
    (e: SelectChangeEvent<string>): void => {
      setAgeGroup(e.target.value);
    },
    [],
  );

  return (
    <div>
      <QueriesRenderer
        queries={{
          data: useJSONDataQuery(
            t.strict({ data: t.array(VaccineDatum) }).decode,
            id,
          ),
        }}
        render={({ data: { data } }) => {
          const rateFactor = 100 / adrReportRate;

          const currentVaccinations =
            distribution[distribution.length - 1].people_vaccinated;
          const totalVaccinations = currentVaccinations;
          const todayDatum = data[data.length - 1];

          const totalDeaths =
            getValueForAgeGroup(todayDatum, ageGroup) * rateFactor;

          const deathRate = (totalDeaths / totalVaccinations) * 100;
          const estimatedDeaths = deathRate * populationNumber;
          const totalADRs = data[data.length - 1].total_injuries;
          const ADRRatio = totalADRs / totalVaccinations;

          return (
            <Grid container spacing={3}>
              <Grid container spacing={2}>
                <Grid item md={2}>
                  <Typography variant="h5">Filters</Typography>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel id="adr-report-rate-select-label">
                      ADR Rate %
                    </InputLabel>
                    <Select
                      labelId="adr-report-rate-select-label"
                      id="adr-report-rate-select"
                      value={adrReportRate}
                      onChange={handleADRReportRateChange}
                      MenuProps={MenuProps}
                    >
                      <MenuItem value={adrReportRate100}>100%</MenuItem>
                      <MenuItem value={adrReportRate10}>10%</MenuItem>
                      <MenuItem value={adrReportRate1}>1%</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel id="age-group-select-label">
                      Age Group
                    </InputLabel>
                    <Select
                      labelId="age-group-select-label"
                      id="age-group-select"
                      value={ageGroup}
                      onChange={handlePatientAgeGroupChange}
                      MenuProps={MenuProps}
                    >
                      <MenuItem value={"All"}>All</MenuItem>
                      {AgeGroup.types.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel id="manufacturer-select-label">
                      Manufacturer
                    </InputLabel>
                    <Select
                      labelId="manufacturer-select-label"
                      id="manufacturer-simple-select"
                      value={manufacturer}
                      onChange={handleManufacturerChange}
                      MenuProps={MenuProps}
                    >
                      <MenuItem key={"All"} value={"All"}>
                        All
                      </MenuItem>
                      {Manufacturer.types.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item md={10}>
                  <Grid container spacing={2}>
                    <Grid item md={12}>
                      <ParentSize style={{ width: "100%" }}>
                        {({ width }) => {
                          return (
                            <VaccineADRGraphComponent
                              width={width}
                              height={500}
                              data={data}
                              distribution={distribution}
                              adrReportFactor={rateFactor}
                              ageGroup={ageGroup}
                            />
                          );
                        }}
                      </ParentSize>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item md={3}>
                  <StatAccordion
                    caption={"Total ADRs"}
                    summary={totalADRs.toFixed(0)}
                    details={
                      <VaccineDatumTable
                        data={[
                          ["injuries", "yellow", todayDatum.total_injuries],
                          ["severe", "red", todayDatum.severe],
                        ]}
                      />
                    }
                  />
                  <Typography variant="caption">
                    Report rate {ADRRatio.toFixed(4)}%
                  </Typography>
                </Grid>
                <Grid item md={3}>
                  <StatAccordion
                    caption="Total deaths"
                    summary={totalDeaths.toFixed(0)}
                    details={
                      <VaccineDatumTable
                        data={[
                          todayDatum.total_death_0_1_month,
                          todayDatum.total_death_2_month_2_years,
                          todayDatum.total_death_3_11_years,
                          todayDatum.total_death_12_17_years,
                          todayDatum.total_death_18_64_years,
                          todayDatum.total_death_65_85_years,
                          todayDatum.total_death_more_than_85_years,
                          todayDatum.total_death_years_not_specified,
                          todayDatum.total_deaths,
                        ].map((v, i) => {
                          const ageGroup = AgeGroup.types[i]
                            ? AgeGroup.types[i].value
                            : "all";
                          const color = getAgeGroupColor(ageGroup);
                          return [ageGroup, color, v];
                        })}
                      />
                    }
                  />
                </Grid>
                <Grid item md={3} direction="column">
                  <StatAccordion
                    summary={deathRate.toFixed(6)}
                    caption="Death rate (%)"
                  />
                </Grid>
                <Grid item md={3} direction="column">
                  <StatAccordion
                    caption="Death projection on world population (million)"
                    summary={toMillion(estimatedDeaths).toFixed(2)}
                  />
                </Grid>
              </Grid>
            </Grid>
          );
        }}
      />
    </div>
  );
};
