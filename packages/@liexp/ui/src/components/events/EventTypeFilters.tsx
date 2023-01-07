import {
  Death,
  Documentary,
  EventType,
  Patent,
  ScientificStudy,
  Transaction,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { clsx } from "clsx";
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
    width: "100%",
  },
  [`& .${classes.iconButton}`]: {
    marginRight: -15,
    opacity: 0.5,
    [`& .${classes.typeTotal}`]: {
      display: "none",
    },
  },
  [`& .${classes.iconButtonSelected}`]: {
    opacity: 1,
  },
  [`&:hover .${classes.iconButton}`]: {
    marginRight: 10,
    [`& .${classes.typeTotal}`]: {
      display: "block",
    },
  },
}));

const eventIconProps = {
  size: "sm" as const,
  style: {
    marginRight: 10,
    width: 18,
    height: 18,
  },
};

export interface EventTypeFiltersProps {
  filters: { [K in EventType]: boolean };
  totals: EventTotals;
  onChange: (f: EventType) => void;
}

export const EventTypeFilters: React.FC<EventTypeFiltersProps> = ({
  filters,
  totals,
  onChange,
}) => {
  return (
    <StyledBox className={classes.root}>
      <IconButton
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Uncategorized,
        })}
        color="primary"
        onClick={() => {
          onChange(Uncategorized.UNCATEGORIZED.value);
        }}
        size="large"
      >
        <EventIcon type="Uncategorized" {...eventIconProps} />
        <Typography className={classes.typeTotal} variant="caption">{totals.uncategorized}</Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Death,
        })}
        onClick={() => {
          onChange(Death.DEATH.value);
        }}
        size="large"
      >
        <EventIcon type="Death" {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>{totals.deaths}</Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.ScientificStudy,
        })}
        onClick={() => {
          onChange(ScientificStudy.SCIENTIFIC_STUDY.value);
        }}
        size="large"
      >
        <EventIcon type="ScientificStudy" {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>{totals.scientificStudies}</Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Documentary,
        })}
        onClick={() => {
          onChange(Documentary.DOCUMENTARY.value);
        }}
        size="large"
      >
        <EventIcon type={Documentary.DOCUMENTARY.value} {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>{totals.documentaries}</Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Patent,
        })}
        onClick={() => {
          onChange(Patent.PATENT.value);
        }}
        size="large"
      >
        <EventIcon type="Patent" {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>{totals.patents}</Typography>
      </IconButton>
      <IconButton
        color="primary"
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Transaction,
        })}
        onClick={() => {
          onChange(Transaction.TRANSACTION.value);
        }}
        size="large"
      >
        <EventIcon type="Transaction" {...eventIconProps} />
        <Typography variant="caption" className={classes.typeTotal}>{totals.transactions}</Typography>
      </IconButton>
    </StyledBox>
  );
};
