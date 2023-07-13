// import { formatDate } from "@liexp/shared/lib/utils/date";
import { type GetListLinkQuery } from "@liexp/shared/lib/io/http/Link";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreOutlined";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import * as React from "react";
import { type serializedType } from "ts-io-error/lib/Codec";
import { useLinksQuery } from "../state/queries/link.queries";
import QueriesRenderer from "./QueriesRenderer";
import { LinksList, type LinksListProps } from "./lists/LinkList";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "./mui";

// interface LinksListProps {
//   layout?: "list" | { md: number; sm: number; lg: number };
//   links: http.Link.Link[];
//   onClick: (l: http.Link.Link) => void;
// }

// export const LinksList: React.FC<LinksListProps> = ({
//   layout = "list",
//   links,
//   onClick,
// }) => {
//   const gridProps =
//     layout === "list"
//       ? {
//           md: 12,
//           lg: 12,
//           sm: 12,
//           xs: 12,
//         }
//       : layout;
//   return (
//     <Grid
//       container
//       spacing={2}
//       style={{
//         maxHeight: "100%",
//         display: "flex",
//         alignItems: "center",
//       }}
//     >
//       {links.map((l, i) => (
//         <Grid
//           {...gridProps}
//           key={l.id}
//           item
//           style={{
//             display: "flex",
//           }}
//         >
//           <LinkCard link={{ ...l, selected: false }} onClick={onClick} />
//         </Grid>
//       ))}
//     </Grid>
//   );
// };

interface LinksBoxProps extends Omit<LinksListProps, "links"> {
  filter: Partial<serializedType<typeof GetListLinkQuery>>;
  defaultExpanded?: boolean;
  style?: React.CSSProperties;
  onOpen?: () => void;
  onClose?: () => void;
}

export const LinksBox: React.FC<LinksBoxProps> = ({
  filter,
  defaultExpanded = false,
  onOpen,
  onClose,
  onItemClick,
  column,
  style,
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const perPage = filter?.ids?.length ?? 20;

  return (
    <QueriesRenderer
      queries={{
        links: useLinksQuery(
          {
            pagination: { page: 1, perPage },
            filter: expanded ? filter : {},
          },
          true,
        ),
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
              ...style,
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
                  ({links.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails
              style={{
                maxHeight: "100%",
              }}
            >
              <LinksList
                column={column}
                links={links.map((l) => ({ ...l, selected: true }))}
                onItemClick={onItemClick}
              />
            </AccordionDetails>
          </Accordion>
        );
      }}
    />
  );
};

export const LinksListBox: React.FC<LinksBoxProps> = ({
  filter,
  onItemClick,
  column,
}) => {
  const perPage = filter?.ids?.length ?? 20;

  return (
    <QueriesRenderer
      queries={{
        links: useLinksQuery(
          {
            pagination: { page: 1, perPage },
            filter,
          },
          true,
        ),
      }}
      render={({ links: { data: links } }) => {
        return (
          <LinksList
            column={column}
            links={links.map((l) => ({ ...l, selected: true }))}
            onItemClick={onItemClick}
          />
        );
      }}
    />
  );
};
