import { ErrorBox } from "@components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import {
  AgeGroup,
  EighteenToSixtyFourYears,
  MoreThanEightyFiveYears,
  NotSpecified,
  SixtyFiveToEightyfiveYears,
  ThreeToTwelveYears,
  TwelveToSixteenYears,
  TwoMonthsToTwoYears,
  VaccineDatum,
  ZeroToOneMonth,
} from "@io/http/covid/VaccineDatum";
import { VaccineDistributionDatum } from "@io/http/covid/VaccineDistributionDatum";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Typography,
  TypographyProps,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { jsonData } from "@providers/DataProvider";
import { AxisBottom, AxisLeft, AxisRight } from "@vx/axis";
import { curveBasis } from "@vx/curve";
import { localPoint } from "@vx/event";
import { LinearGradient } from "@vx/gradient";
import { Group } from "@vx/group";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleLinear, scaleTime } from "@vx/scale";
import { Bar, LinePath } from "@vx/shape";
import { Accessor } from "@vx/shape/lib/types";
import { withTooltip, TooltipWithBounds } from "@vx/tooltip";
import * as QR from "avenger/lib/QueryResult";
import { declareQueries } from "avenger/lib/react";
import { isDate, formatISO } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as React from "react";

// const eudrUpTo1MonthColor = "#456321";
// const eudrUp2Months2Years = "#ed34ca";

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

const getByAgeGroup =
  (map: Record<string, string>) =>
  (ag: AgeGroup): string => {
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

const useStyles = makeStyles((theme) => ({
  formControl: {
    position: "relative",
    minWidth: 120,
    marginBottom: theme.spacing(2),
  },
  root: {
    width: "100%",
  },
  graphAccordionHeading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

const populationNumber = 8 * 10e8;

const getReportX: Accessor<VaccineDatum, Date> = (d) => {
  return d.date;
};

const MakeGetReportY: (
  ageGroup: AgeGroup | undefined,
  adrReportFactor: number
) => Accessor<VaccineDatum, number> = (ageGroup, adrReportFactor) => (d) => {
  return getValueForAgeGroup(d, ageGroup) * adrReportFactor;
};

const getDistributionX: Accessor<VaccineDistributionDatum, Date> = (d) => {
  return d.date;
};

const getDistributionY: Accessor<VaccineDistributionDatum, number> = (d) => {
  return d.total_vaccinations;
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
  v: VaccineDatum
): Array<[string, string, number]> => {
  return [
    v.total_death_0_1_month,
    v.total_death_2_month_2_years,
    v.total_death_3_11_years,
    v.total_death_12_17_years,
    v.total_death_18_64_years,
    v.total_death_65_85_years,
    v.total_death_more_than_85_years,
  ].map((v, i) => {
    const ageGroup = AgeGroup.types[i].value;
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

interface StatAccordionProps {
  summary: string;
  caption: string;
  data: Array<[string, string, number]>;
}

const StatAccordion: React.FC<StatAccordionProps> = ({
  caption,
  summary,
  data,
}) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        IconButtonProps={{
          edge: "end",
        }}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Box display="flex" width="100%" flexDirection="column">
          <Box display="flex">
            <Typography variant="caption" style={{ width: "100%" }}>
              {caption}
            </Typography>
          </Box>
          <Box display="flex" alignItems="flex-end">
            <Typography
              variant="h3"
              style={{
                margin: 0,
                textAlign: "right",
                width: "100%",
              }}
            >
              {summary}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <VaccineDatumTable data={data} />
      </AccordionDetails>
    </Accordion>
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

  const xScaleDomain = [new Date("2020-12-20"), new Date()];
  const xScale = scaleTime<Date>({
    domain: xScaleDomain,
  });

  const getReportY = React.useMemo(
    () => MakeGetReportY(ageGroup, adrReportFactor),
    [ageGroup, adrReportFactor]
  );

  const currentTotalVaccinations =
    distribution[distribution.length - 1].total_vaccinations;
  const totalVaccinations =
    typeof currentTotalVaccinations === "string" ? 0 : currentTotalVaccinations;
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
              strokeWidth={1}
              curve={curveBasis}
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
              strokeWidth={1}
              shapeRendering="geometricPrecision"
              curve={curveBasis}
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

const MenuProps = {
  style: {
    maxWidth: 300,
    maxHeight: 300,
  },
};

const adrReportRate100 = 100;
const adrReportRate10 = 10;
const adrReportRate1 = 1;

const allManufacturer = "eudrvigilance";
const pfizerManufacturer = "pfizer";
const modernaManufacturer = "moderna";
const astrazenecaManufacturer = "astrazeneca";

interface VaccineADRGraphProps {
  queries: QR.QueryResult<Error, { data: { data: VaccineDatum[] } }>;
  distribution: VaccineDistributionDatum[];
}

const withQueries = declareQueries({
  data: jsonData(t.strict({ data: t.array(VaccineDatum) }).decode),
});

export const VaccineADRGraph = withQueries<VaccineADRGraphProps>(
  ({ queries, distribution }) => {
    const [adrReportRate, setADRReportRate] = React.useState(adrReportRate100);
    const [manufacturer, setManufacturer] = React.useState(allManufacturer);
    const [ageGroup, setAgeGroup] = React.useState(undefined);

    const classes = useStyles();

    const handleADRReportRateChange = React.useCallback(
      (event: React.ChangeEvent<{ name?: string; value: any }>): void => {
        setADRReportRate(event.target.value);
      },
      []
    );

    const handleManufacturerChange = React.useCallback(
      (event: React.ChangeEvent<{ name?: string; value: any }>): void => {
        setManufacturer(event.target.value);
      },
      []
    );

    const handlePatientAgeGroupChange = React.useCallback(
      (e: React.ChangeEvent<{ name?: string; value: any }>): void => {
        setAgeGroup(e.target.value);
      },
      []
    );

    return (
      <div>
        {pipe(
          queries,
          QR.fold(LazyFullSizeLoader, ErrorBox, ({ data: { data } }) => {
            const rateFactor = 100 / adrReportRate;

            const currentVaccinations =
              distribution[distribution.length - 1].total_vaccinations;
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
                <Box display="flex">
                  <Typography variant="h2">Vaccine ADR Graph</Typography>
                </Box>
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
                        <MenuItem value={allManufacturer}>All</MenuItem>
                        <MenuItem value={pfizerManufacturer}>Pfizer</MenuItem>
                        <MenuItem value={modernaManufacturer}>Moderna</MenuItem>
                        <MenuItem value={astrazenecaManufacturer}>
                          {astrazenecaManufacturer}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item md={10}>
                    <Grid container spacing={2}>
                      <Grid item md={3}>
                        <FormControl fullWidth>
                          <InputLabel id="age-group-select-label">
                            Age Group
                          </InputLabel>
                          <Select
                            labelId="age-group-select-label"
                            id="age-group-simple-select"
                            value={ageGroup}
                            onChange={handlePatientAgeGroupChange}
                            MenuProps={MenuProps}
                          >
                            <MenuItem value={undefined}>All</MenuItem>
                            {AgeGroup.types.map((t) => (
                              <MenuItem key={t.value} value={t.value}>
                                {t.value}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
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
                      data={[
                        ["injuries", "yellow", todayDatum.total_injuries],
                        ["severe", "red", todayDatum.severe],
                      ]}
                    />
                    <Typography variant="caption">
                      Report rate {ADRRatio.toFixed(4)}%
                    </Typography>
                  </Grid>
                  <Grid item md={3}>
                    <StatAccordion
                      caption="Total deaths"
                      summary={totalDeaths.toFixed(0)}
                      data={[
                        todayDatum.total_death_0_1_month,
                        todayDatum.total_death_2_month_2_years,
                        todayDatum.total_death_3_11_years,
                        todayDatum.total_death_12_17_years,
                        todayDatum.total_death_18_64_years,
                        todayDatum.total_death_65_85_years,
                        todayDatum.total_death_more_than_85_years,
                      ].map((v, i) => {
                        const ageGroup = AgeGroup.types[i].value;
                        const color = getAgeGroupColor(ageGroup);
                        return [ageGroup, color, v];
                      })}
                    />
                  </Grid>
                  <Grid item md={3} direction="column">
                    <StatAccordion
                      summary={deathRate.toFixed(6)}
                      caption="Death rate (%)"
                      data={[]}
                    />
                  </Grid>
                  <Grid item md={3} direction="column">
                    <StatAccordion
                      caption="Death projection on world population (million)"
                      summary={toMillion(estimatedDeaths).toFixed(2)}
                      data={[]}
                    />
                  </Grid>
                </Grid>
              </Grid>
            );
          })
        )}
      </div>
    );
  }
);
