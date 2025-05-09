import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { type serializedType } from "@ts-endpoint/core";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { MediaList } from "../components/lists/MediaList.js";
import { Box, Pagination, Stack } from "../components/mui/index.js";

export interface MediaBoxProps {
  filter: Partial<serializedType<typeof Endpoints.Media.List.Input.Query>>;
  onClick: (e: Media.Media) => void;
  style?: React.CSSProperties;
  limit?: number;
  perPage?: number;
  enableDescription?: boolean;
  disableZoom?: boolean;
  columns?: number;
  discrete?: boolean;
}

export const MediaBox: React.FC<MediaBoxProps> = ({
  filter,
  limit,
  onClick,
  style,
  perPage = 20,
  discrete = true,
  ...props
}) => {
  const [page, setPage] = React.useState(1);
  const handlePageChange = (p: number): void => {
    setPage(p);
  };

  return (
    <QueriesRenderer
      queries={(Q) => ({
        media: Q.Media.list.useQuery(
          {
            filter: {
              ...filter,
              _end: limit ? `${limit}` : undefined,
            },
          },
          undefined,
          discrete,
        ),
      })}
      render={({ media: { total, data: media } }) => {
        return (
          <Stack style={{ height: "100%", width: "100%", ...style }}>
            <Box
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
              }}
            >
              <MediaList
                {...props}
                style={style}
                media={media.map((m) => ({ ...m, selected: true }))}
                onItemClick={onClick}
              />
            </Box>

            {!limit && total > media.length ? (
              <Box
                style={{
                  display: "flex",
                  flexShrink: 0,
                  justifyContent: "center",
                  margin: 20,
                }}
              >
                <Pagination
                  color="primary"
                  count={Math.floor(total / perPage)}
                  page={page}
                  onChange={(ev, page) => {
                    handlePageChange(page);
                  }}
                />
              </Box>
            ) : null}
          </Stack>
        );
      }}
    />
  );
};
