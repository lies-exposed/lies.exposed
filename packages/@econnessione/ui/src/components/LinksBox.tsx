import {
  Accordion,
  AccordionDetails,
  AccordionSummary, Grid, List,
  ListItem,
  Typography
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMoreOutlined";
import * as QR from "avenger/lib/QueryResult";
import { declareQueries } from "avenger/lib/react";
import { pipe } from "fp-ts/lib/function";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Queries } from "../providers/DataProvider";
import LinkCard from "./Cards/LinkCard";
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";

interface LinksBoxProps {
  ids: string[];
}

const withQueries = declareQueries({ links: Queries.Link.getList });
export const LinksList = withQueries(({ queries }) => {
  return pipe(
    queries,
    QR.fold(LazyFullSizeLoader, ErrorBox, ({ links: { data: links } }) => {
      // eslint-disable-next-line react/jsx-key
      return (
        <Accordion defaultExpanded={true}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id={"link-accordion"}
          >
            <Typography variant="h6">Links</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {links.map((l, i) => (
                <Grid item key={i} md={4} sm={6}>
                  <LinkCard link={l} />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      );
    })
  );
});

export const LinksBox: React.FC<LinksBoxProps> = ({ ids }) => {
  return pipe(
    ids,
    NEA.fromArray,
    O.fold(
      () => <Typography>No links</Typography>,
      (ids) => (
        <LinksList
          queries={{
            links: {
              pagination: { page: 1, perPage: 10 },
              sort: { field: "createdAt", order: "DESC" },
              filter: {
                ids,
              },
            },
          }}
        />
      )
    )
  );
};
