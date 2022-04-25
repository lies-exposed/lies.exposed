import { http } from "@liexp/shared/io";
// import { formatDate } from "@liexp/shared/utils/date";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMoreOutlined";
import LinkIcon from "@material-ui/icons/LinkOutlined";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useLinksQuery } from "../state/queries/DiscreteQueries";
import LinkCard from "./Cards/LinkCard";
import QueriesRenderer from "./QueriesRenderer";

// interface LinkListItemProps {
//   data: http.Link.Link;
// }

// const LinkListItem: React.FC<LinkListItemProps> = ({ data }) => {
//   return (
//     <Box>
//       {data.publishDate ? (
//         <Typography variant="caption">
//           {" "}
//           ({formatDate(data.publishDate)})
//         </Typography>
//       ) : (
//         " "
//       )}{" "}
//       - <Link href={data.url}>{data.title}</Link>
//     </Box>
//   );
// };

interface LinksListProps {
  links: http.Link.Link[];
}

export const LinksList: React.FC<LinksListProps> = ({ links }) => {
  return (
    <Grid container spacing={2}>
      {links.map((l, i) => (
        <Grid key={l.id} item md={3} sm={4} xs={2}>
          <LinkCard link={l} />
        </Grid>
      ))}
    </Grid>
  );
};

interface LinksBoxProps {
  ids: string[];
  defaultExpanded?: boolean;
  style?: React.CSSProperties;
  onOpen?: () => void;
  onClose?: () => void;
}

export const LinksBox: React.FC<LinksBoxProps> = ({
  ids,
  defaultExpanded = false,
  onOpen,
  onClose,
  style,
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return pipe(
    ids,
    NEA.fromArray,
    O.fold(
      () => <span />,
      (ids) => (
        <Accordion
          defaultExpanded={expanded}
          expanded={expanded}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e, expanded) => {
            setExpanded(expanded);
            if (expanded) {
              onOpen?.();
            } else {
              onClose?.();
            }
          }}
          elevation={0}
          style={{
            width: "100%",
            background: "transparent",
            maxHeight: "100%",
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
              padding: 0,
              height: "100%",
            }}
          >
            <Box display="flex" width="100%" padding={0}>
              <LinkIcon />{" "}
              <Typography component="span" variant="subtitle2">
                ({ids.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails
            style={{
              maxHeight: "100%",
            }}
          >
            <QueriesRenderer
              queries={{
                links: useLinksQuery({
                  pagination: { page: 1, perPage: ids.length },
                  sort: { field: "createdAt", order: "DESC" },
                  filter: {
                    ids: expanded ? ids : [],
                  },
                }),
              }}
              render={({ links: { data: links } }) => {
                return <LinksList links={links} />;
              }}
            />
          </AccordionDetails>
        </Accordion>
      )
    )
  );
};
