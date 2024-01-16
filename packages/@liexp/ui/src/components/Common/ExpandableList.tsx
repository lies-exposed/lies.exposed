import * as React from "react";
import { styled } from "../../theme/index.js";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Icons,
} from "../mui/index.js";
import { List, type ListProps } from "./List.js";

const PREFIX = "expandable-list";
const classes = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
};

const StyledAccordion = styled(Accordion)(() => ({
  [`&.${classes.root}`]: {
    boxShadow: "none",
    background: "transparent",
  },
  [`.${classes.content}`]: {
    display: "flex",
    flexDirection: "column",
  },
}));

export type ExpandableListProps<
  A,
  D extends React.ElementType<any> = "ul",
> = ListProps<A, D> & { limit: number };

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const ExpandableList = <A, D extends React.ElementType<any> = "ul">({
  data,
  limit,
  getKey,
  ListItem,
  filter,
  ...props
}: ExpandableListProps<A, D>): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const summaryData = open ? data.filter(filter) : data.slice(0, limit);

  const showMore = data.length - summaryData.length;
  const hasMore = showMore > 0;

  const expandedData = open ? data.filter((d) => !filter(d)) : [];
  return (
    <StyledAccordion className={classes.root} expanded={open}>
      <AccordionSummary
        classes={{
          content: classes.content,
        }}
      >
        <List
          {...(props as any)}
          getKey={getKey}
          ListItem={ListItem}
          filter={filter}
          data={summaryData}
        />
        {hasMore ? (
          <Button
            size="small"
            startIcon={<Icons.AddCircle />}
            onClick={() => {
              setOpen(!open);
            }}
          >
            {showMore}
          </Button>
        ) : null}
      </AccordionSummary>
      <AccordionDetails>
        <List
          {...(props as any)}
          getKey={getKey}
          ListItem={ListItem}
          filter={filter}
          data={expandedData}
        />
      </AccordionDetails>
    </StyledAccordion>
  );
};
