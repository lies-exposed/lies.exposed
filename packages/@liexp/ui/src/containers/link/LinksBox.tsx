import { type GetListLinkQuery } from "@liexp/shared/lib/io/http/Link.js";
import * as React from "react";
import {
  type RecordCodecEncoded
} from "ts-io-error/lib/Codec";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import {
  LinksList,
  type LinksListProps,
} from "../../components/lists/LinkList.js";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Icons,
  Typography,
} from "../../components/mui/index.js";

export interface LinksBoxProps extends Omit<LinksListProps, "links"> {
  filter: Partial<RecordCodecEncoded<typeof GetListLinkQuery>>;
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
      queries={(Q) => ({
        links: Q.Link.list.useQuery(
          {
            pagination: { page: 1, perPage },
            filter: expanded ? filter : {},
          },
          undefined,
          true,
        ),
      })}
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
              expandIcon={<Icons.ExpandMore />}
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
                <Icons.LinkIcon />{" "}
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
