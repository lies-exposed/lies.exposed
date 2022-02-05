import { Link } from "@econnessione/shared/io/http";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMoreOutlined";
import LinkIcon from "@material-ui/icons/LinkOutlined";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { linksDiscreteQuery } from "../state/queries/DiscreteQueries";
import LinkCard from "./Cards/LinkCard";
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";

interface LinksListProps {
  links: Link.Link[];
}

export const LinksList: React.FC<LinksListProps> = ({ links }) => {
  return (
    <Grid container spacing={2}>
      {links.map((l, i) => (
        <Grid item key={i} md={4} sm={6}>
          <LinkCard link={l} />
        </Grid>
      ))}
    </Grid>
  );
};

interface LinksBoxProps {
  ids: string[];
}

export const LinksBox: React.FC<LinksBoxProps> = ({ ids }) => {
  const [expanded, setExpanded] = React.useState(false);

  return pipe(
    ids,
    NEA.fromArray,
    O.fold(
      () => <Typography>No links</Typography>,
      (ids) => (
        <Accordion
          defaultExpanded={expanded}
          expanded={expanded}
          onChange={(e, expanded) => {
            setExpanded(expanded);
          }}
          elevation={0}
          style={{
            width: "100%",
            background: "transparent",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id={"link-accordion"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LinkIcon />
            <Typography variant="subtitle2">{ids.length}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <WithQueries
              queries={{ links: linksDiscreteQuery }}
              params={{
                links: {
                  pagination: { page: 1, perPage: 10 },
                  sort: { field: "createdAt", order: "DESC" },
                  filter: {
                    ids: expanded ? ids : [],
                  },
                },
              }}
              render={QR.fold(
                LazyFullSizeLoader,
                ErrorBox,
                ({ links: { data: links } }) => {
                  return <LinksList links={links} />;
                }
              )}
            />
          </AccordionDetails>
        </Accordion>
      )
    )
  );
};
