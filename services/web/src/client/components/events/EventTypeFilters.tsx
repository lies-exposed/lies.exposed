import { Death, Documentary, EventType, Patent, ScientificStudy, Transaction, Uncategorized } from "@liexp/shared/io/http/Events";
import { EventIcon } from "@liexp/ui/components/Common/Icons";
import { Box, IconButton, Typography } from "@liexp/ui/components/mui";
import { styled } from "@liexp/ui/theme";
import { clsx } from "clsx";
import * as React from "react";

const PREFIX = "event-type-filters";

const classes = {
  iconButton: `${PREFIX}-iconButton`,
  iconButtonSelected: `${PREFIX}-iconButtonSelected`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.iconButton}`]: {
    marginRight: 10,
    opacity: 0.5,
  },

  [`& .${classes.iconButtonSelected}`]: {
    opacity: 1,
  },
}));

const eventIconProps = {
  size: "sm" as const,
  style: {
    marginRight: 10,
    width: 18,
    height: 18
  },
};

export interface EventTypeFiltersProps {
  filters: Record<EventType, boolean>
  totals: any;
  onChange: (f: EventType) => void;
}

export const EventTypeFilters: React.FC<EventTypeFiltersProps> = ({
  filters,
  totals,
  onChange
}) => {
  return (
    <StyledBox
      style={{
        display: "flex",
        width: "100%",
      }}
    >
      <IconButton
        className={clsx(classes.iconButton, {
          [classes.iconButtonSelected]: filters.Uncategorized,
        })}
        color="primary"
        style={{ marginRight: 10 }}
        onClick={() => {
          onChange(Uncategorized.UNCATEGORIZED.value);
        }}
        size="large"
      >
        <EventIcon type="Uncategorized" {...eventIconProps} />
        <Typography variant="caption">{totals.uncategorized}</Typography>
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
        <Typography variant="caption">{totals.deaths}</Typography>
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
        <Typography variant="caption">{totals.scientificStudies}</Typography>
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
        <Typography variant="caption">{totals.documentaries}</Typography>
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
        <Typography variant="caption">{totals.patents}</Typography>
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
        <Typography variant="caption">{totals.transactions}</Typography>
      </IconButton>
    </StyledBox>
  );
};
