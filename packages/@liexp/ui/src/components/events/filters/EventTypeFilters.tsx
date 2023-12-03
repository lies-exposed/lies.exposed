import { fp, pipe } from "@liexp/core/lib/fp";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals";
import {
  type EventType,
  EventTypes,
} from "@liexp/shared/lib/io/http/Events/EventType";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../../theme";
import { EventIcon } from "../../Common/Icons";
import { Box, Grid, IconButton, Typography } from "../../mui";

const PREFIX = "event-type-filters";

const classes = {
  root: `${PREFIX}-root`,
  iconButton: `${PREFIX}-iconButton`,
  iconButtonSelected: `${PREFIX}-iconButtonSelected`,
  typeTotal: `${PREFIX}-type-total`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  [`& .${classes.iconButton}`]: {
    marginRight: -18,
    opacity: 0.5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    [`& .${classes.typeTotal}`]: {
      marginTop: 10,
      display: "flex",
    },
  },
  [`& .${classes.iconButtonSelected}`]: {
    opacity: 1,
  },
  // [`&:hover .${classes.iconButton}`]: {
  //   // marginRight: 5,
  //   [`& .${classes.typeTotal}`]: {
  //     display: "flex",
  //   },
  // },
}));

const eventIconProps = {
  size: "sm" as const,
  style: {
    // marginRight: 10,
    width: 18,
    height: 18,
  },
};

export type EventTypeMap = { [K in EventType]: boolean };

export interface EventTypeFiltersProps {
  filters: Partial<EventTypeMap>;
  totals: EventTotals;
  onChange: (f: EventTypeMap, t: EventType) => void;
}

export const allFiltersEnabled: EventTypeMap = {
  [EventTypes.BOOK.value]: true,
  [EventTypes.DEATH.value]: true,
  [EventTypes.UNCATEGORIZED.value]: true,
  [EventTypes.SCIENTIFIC_STUDY.value]: true,
  [EventTypes.PATENT.value]: true,
  [EventTypes.DOCUMENTARY.value]: true,
  [EventTypes.TRANSACTION.value]: true,
  [EventTypes.QUOTE.value]: true,
};
export const EventTypeFilters: React.FC<EventTypeFiltersProps> = ({
  filters: _filters,
  totals,
  onChange,
}) => {
  const filters = React.useMemo(
    () => ({
      ...allFiltersEnabled,
      ..._filters,
    }),
    [_filters],
  );

  const handleFilterChange = React.useCallback(
    (filterK: EventType) => {
      const allEnabled = pipe(
        filters,
        fp.R.reduce(fp.S.Ord)(true, (acc, b) => acc && b),
      );

      const allDisabled = pipe(
        filters,
        fp.R.reduce(fp.S.Ord)(true, (acc, b) => acc && !b),
      );

      const ff: EventTypeMap = allEnabled
        ? {
            [EventTypes.BOOK.value]: false,
            [EventTypes.DOCUMENTARY.value]: false,
            [EventTypes.PATENT.value]: false,
            [EventTypes.TRANSACTION.value]: false,
            [EventTypes.UNCATEGORIZED.value]: false,
            [EventTypes.DEATH.value]: false,
            [EventTypes.SCIENTIFIC_STUDY.value]: false,
            [EventTypes.QUOTE.value]: false,
            [filterK]: true,
          }
        : allDisabled
          ? {
              [EventTypes.BOOK.value]: true,
              [EventTypes.DOCUMENTARY.value]: true,
              [EventTypes.PATENT.value]: true,
              [EventTypes.TRANSACTION.value]: true,
              [EventTypes.UNCATEGORIZED.value]: true,
              [EventTypes.DEATH.value]: true,
              [EventTypes.SCIENTIFIC_STUDY.value]: true,
              [EventTypes.QUOTE.value]: true,
            }
          : {
              ...filters,
              [filterK]: !filters[filterK],
            };

      onChange(ff, filterK);
    },
    [onChange],
  );

  const gridItemProps = {
    item: true,
    md: "auto" as const,
    style: {
      marginLeft: 5,
      marginRight: 5,
    },
  };

  return (
    <StyledBox className={classes.root}>
      <Grid container style={{ width: "100%" }}>
        <Grid {...gridItemProps}>
          <IconButton
            className={clsx(classes.iconButton, {
              [classes.iconButtonSelected]: filters.Uncategorized,
            })}
            color="primary"
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(EventTypes.UNCATEGORIZED.value);
            }}
            size="large"
          >
            <EventIcon type="Uncategorized" {...eventIconProps} />
            <Typography className={classes.typeTotal} variant="caption">
              {totals.uncategorized}
            </Typography>
          </IconButton>
        </Grid>
        <Grid {...gridItemProps}>
          <IconButton
            color="primary"
            className={clsx(classes.iconButton, {
              [classes.iconButtonSelected]: filters.Death,
            })}
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(EventTypes.DEATH.value);
            }}
            size="large"
          >
            <EventIcon type="Death" {...eventIconProps} />
            <Typography variant="caption" className={classes.typeTotal}>
              {totals.deaths}
            </Typography>
          </IconButton>
        </Grid>
        <Grid {...gridItemProps}>
          <IconButton
            color="primary"
            className={clsx(classes.iconButton, {
              [classes.iconButtonSelected]: filters.ScientificStudy,
            })}
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(EventTypes.SCIENTIFIC_STUDY.value);
            }}
            size="large"
          >
            <EventIcon type="ScientificStudy" {...eventIconProps} />
            <Typography variant="caption" className={classes.typeTotal}>
              {totals.scientificStudies}
            </Typography>
          </IconButton>
        </Grid>
        <Grid {...gridItemProps}>
          <IconButton
            color="primary"
            className={clsx(classes.iconButton, {
              [classes.iconButtonSelected]: filters.Documentary,
            })}
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(EventTypes.DOCUMENTARY.value);
            }}
            size="large"
          >
            <EventIcon
              type={EventTypes.DOCUMENTARY.value}
              {...eventIconProps}
            />
            <Typography variant="caption" className={classes.typeTotal}>
              {totals.documentaries}
            </Typography>
          </IconButton>
        </Grid>
        <Grid {...gridItemProps}>
          <IconButton
            color="primary"
            className={clsx(classes.iconButton, {
              [classes.iconButtonSelected]: filters.Book,
            })}
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(EventTypes.BOOK.value);
            }}
            size="large"
          >
            <EventIcon type={EventTypes.BOOK.value} {...eventIconProps} />
            <Typography variant="caption" className={classes.typeTotal}>
              {totals.books}
            </Typography>
          </IconButton>
        </Grid>
        <Grid {...gridItemProps}>
          <IconButton
            color="primary"
            className={clsx(classes.iconButton, {
              [classes.iconButtonSelected]: filters.Patent,
            })}
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(EventTypes.PATENT.value);
            }}
            size="large"
          >
            <EventIcon type="Patent" {...eventIconProps} />
            <Typography variant="caption" className={classes.typeTotal}>
              {totals.patents}
            </Typography>
          </IconButton>
        </Grid>
        <Grid {...gridItemProps}>
          <IconButton
            color="primary"
            className={clsx(classes.iconButton, {
              [classes.iconButtonSelected]: filters.Transaction,
            })}
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(EventTypes.TRANSACTION.value);
            }}
            size="large"
          >
            <EventIcon type="Transaction" {...eventIconProps} />
            <Typography variant="caption" className={classes.typeTotal}>
              {totals.transactions}
            </Typography>
          </IconButton>
        </Grid>
        <Grid {...gridItemProps}>
          <IconButton
            color="primary"
            className={clsx(classes.iconButton, {
              [classes.iconButtonSelected]: filters.Quote,
            })}
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(EventTypes.QUOTE.value);
            }}
            size="large"
          >
            <EventIcon type="Quote" {...eventIconProps} />
            <Typography variant="caption" className={classes.typeTotal}>
              {totals.quotes}
            </Typography>
          </IconButton>
        </Grid>
      </Grid>
    </StyledBox>
  );
};
