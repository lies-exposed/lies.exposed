import { fp } from "@liexp/core/fp";
import {
  Death,
  Documentary,
  type EventType,
  Patent,
  ScientificStudy,
  Transaction,
  Uncategorized,
  Quote,
} from "@liexp/shared/io/http/Events";
import { type EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { clsx } from "clsx";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { styled } from "../../theme";
import { EventIcon } from "../Common/Icons";
import { Box, IconButton, Typography } from "../mui";

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
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: "100%",
  },
  [`& .${classes.iconButton}`]: {
    marginRight: -18,
    opacity: 0.5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginRight: 10,
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
  [Death.DEATH.value]: true,
  [Uncategorized.UNCATEGORIZED.value]: true,
  [ScientificStudy.SCIENTIFIC_STUDY.value]: true,
  [Patent.PATENT.value]: true,
  [Documentary.DOCUMENTARY.value]: true,
  [Transaction.TRANSACTION.value]: true,
  [Quote.QUOTE.value]: true,
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
    [_filters]
  );

  const handleFilterChange = React.useCallback(
    (filterK: EventType) => {
      const allEnabled = pipe(
        filters,
        fp.R.reduce(fp.S.Ord)(true, (acc, b) => acc && b)
      );

      const allDisabled = pipe(
        filters,
        fp.R.reduce(fp.S.Ord)(true, (acc, b) => acc && !b)
      );

      const ff: EventTypeMap = allEnabled
        ? {
            [Documentary.DOCUMENTARY.value]: false,
            [Patent.PATENT.value]: false,
            [Transaction.TRANSACTION.value]: false,
            [Uncategorized.UNCATEGORIZED.value]: false,
            [Death.DEATH.value]: false,
            [ScientificStudy.SCIENTIFIC_STUDY.value]: false,
            [Quote.QUOTE.value]: false,
            [filterK]: true,
          }
        : allDisabled
        ? {
            [Documentary.DOCUMENTARY.value]: true,
            [Patent.PATENT.value]: true,
            [Transaction.TRANSACTION.value]: true,
            [Uncategorized.UNCATEGORIZED.value]: true,
            [Death.DEATH.value]: true,
            [ScientificStudy.SCIENTIFIC_STUDY.value]: true,
            [Quote.QUOTE.value]: true,
          }
        : {
            ...filters,
            [filterK]: !filters[filterK],
          };

      onChange(ff, filterK);
    },
    [onChange]
  );

  return (
    <StyledBox className={classes.root}>
      <IconButton
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Uncategorized,
        })}
        color="primary"
        onClick={(e) => {
          e.preventDefault();
          handleFilterChange(Uncategorized.UNCATEGORIZED.value);
        }}
        size="large"
      >
        <EventIcon type="Uncategorized" {...eventIconProps} />
        <Typography className={classes.typeTotal} variant="caption">
          {totals.uncategorized}
        </Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Death,
        })}
        onClick={(e) => {
          e.preventDefault();
          handleFilterChange(Death.DEATH.value);
        }}
        size="large"
      >
        <EventIcon type="Death" {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>
          {totals.deaths}
        </Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.ScientificStudy,
        })}
        onClick={(e) => {
          e.preventDefault();
          handleFilterChange(ScientificStudy.SCIENTIFIC_STUDY.value);
        }}
        size="large"
      >
        <EventIcon type="ScientificStudy" {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>
          {totals.scientificStudies}
        </Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Documentary,
        })}
        onClick={(e) => {
          e.preventDefault();
          handleFilterChange(Documentary.DOCUMENTARY.value);
        }}
        size="large"
      >
        <EventIcon type={Documentary.DOCUMENTARY.value} {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>
          {totals.documentaries}
        </Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Patent,
        })}
        onClick={(e) => {
          e.preventDefault();
          handleFilterChange(Patent.PATENT.value);
        }}
        size="large"
      >
        <EventIcon type="Patent" {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>
          {totals.patents}
        </Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Transaction,
        })}
        onClick={(e) => {
          e.preventDefault();
          handleFilterChange(Transaction.TRANSACTION.value);
        }}
        size="large"
      >
        <EventIcon type="Transaction" {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>
          {totals.transactions}
        </Typography>
      </IconButton>
    </StyledBox>
  );
};
