import { flow, fp } from "@liexp/core/lib/fp/index.js";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import {
  EventTypes,
  type EventType,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../../theme/index.js";
import { EventIcon } from "../../Common/Icons/index.js";
import { Box, Grid, IconButton, Typography } from "../../mui/index.js";

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

export const setAllFiltersTo = (b: boolean): EventTypeMap => ({
  [EventTypes.BOOK.Type]: b,
  [EventTypes.DEATH.Type]: b,
  [EventTypes.UNCATEGORIZED.Type]: b,
  [EventTypes.SCIENTIFIC_STUDY.Type]: b,
  [EventTypes.PATENT.Type]: b,
  [EventTypes.DOCUMENTARY.Type]: b,
  [EventTypes.TRANSACTION.Type]: b,
  [EventTypes.QUOTE.Type]: b,
});

const toEnabled = flow<[EventTypeMap], boolean>(
  fp.Rec.reduce(fp.S.Ord)(true, (acc, b) => acc && b),
);

const toDisabled = flow<[EventTypeMap], boolean>(
  fp.Rec.reduce(fp.S.Ord)(true, (acc, b) => acc && !b),
);

const toNewFilters = (
  filters: EventTypeMap,
  filterK: EventType,
): EventTypeMap => {
  const newFilters = {
    ...filters,
    [filterK]: !filters[filterK],
  };

  const allCurrentEnabled = toEnabled(filters);

  const allCurrentDisabled = toDisabled(filters);

  const allDisabled = toDisabled(newFilters);

  if (allCurrentEnabled) {
    return {
      ...setAllFiltersTo(false),
      [filterK]: true,
    };
  }

  if (allCurrentDisabled) {
    return {
      ...filters,
      [filterK]: true,
    };
  }

  if (allDisabled) {
    return {
      ...setAllFiltersTo(true),
    };
  }

  return {
    ...filters,
    [filterK]: !filters[filterK],
  };
};

export const EventTypeFilters: React.FC<EventTypeFiltersProps> = ({
  filters: _filters,
  totals,
  onChange,
}) => {
  const filters = React.useMemo(
    () => ({
      ...setAllFiltersTo(true),
      ..._filters,
    }),
    [_filters],
  );

  const handleFilterChange = React.useCallback(
    (filterK: EventType) => {
      const ff = toNewFilters(filters, filterK);

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
              handleFilterChange(EventTypes.UNCATEGORIZED.Type);
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
              handleFilterChange(EventTypes.DEATH.Type);
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
              handleFilterChange(EventTypes.SCIENTIFIC_STUDY.Type);
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
              handleFilterChange(EventTypes.DOCUMENTARY.Type);
            }}
            size="large"
          >
            <EventIcon type={EventTypes.DOCUMENTARY.Type} {...eventIconProps} />
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
              handleFilterChange(EventTypes.BOOK.Type);
            }}
            size="large"
          >
            <EventIcon type={EventTypes.BOOK.Type} {...eventIconProps} />
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
              handleFilterChange(EventTypes.PATENT.Type);
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
              handleFilterChange(EventTypes.TRANSACTION.Type);
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
              handleFilterChange(EventTypes.QUOTE.Type);
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
