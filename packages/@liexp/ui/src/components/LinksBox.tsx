import { http } from "@liexp/shared/io";
// import { formatDate } from "@liexp/shared/utils/date";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreOutlined";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import * as React from "react";
import { useLinksQuery } from "../state/queries/DiscreteQueries";
import LinkCard from "./Cards/LinkCard";
import QueriesRenderer from "./QueriesRenderer";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  Typography,
} from "./mui";

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
    <Grid
      container
      spacing={2}
      style={{
        maxHeight: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      {links.map((l, i) => (
        <Grid
          key={l.id}
          item
          md={4}
          sm={6}
          xs={6}
          style={{
            display: "flex",
          }}
        >
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

  return (
    <QueriesRenderer
      queries={{
        links: useLinksQuery({
          pagination: { page: 1, perPage: ids.length },
          sort: { field: "createdAt", order: "DESC" },
          filter: expanded
            ? {
                ids,
              }
            : {},
        }),
      }}
      render={({ links: { data: links } }) => {

        return (
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
              <LinksList links={links} />
            </AccordionDetails>
          </Accordion>
        );
      }}
    />
  );
};
