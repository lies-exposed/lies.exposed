import { http } from "@econnessione/shared/io";
import { formatDate } from "@econnessione/shared/utils/date";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
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
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";

interface LinkListItemProps {
  data: http.Link.Link;
}

const LinkListItem: React.FC<LinkListItemProps> = ({ data }) => {
  return (
    <Box>
      <Link href={data.url}>{data.title}</Link>
      {data.publishDate ? (
        <Typography variant="caption">
          {" "}
          ({formatDate(data.publishDate)})
        </Typography>
      ) : null}
    </Box>
  );
};

interface LinksListProps {
  links: http.Link.Link[];
}

export const LinksList: React.FC<LinksListProps> = ({ links }) => {
  return (
    <Box>
      {links.map((l, i) => (
        <LinkListItem key={l.id} data={l} />
      ))}
    </Box>
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
      () => <span />,
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
              width: "100%",
              padding: 0
            }}
          >
            <Box display="flex" width="100%" padding={0}>
              <LinkIcon />{" "}
              <Typography component="span" variant="subtitle2">
                ({ids.length})
              </Typography>
            </Box>
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
