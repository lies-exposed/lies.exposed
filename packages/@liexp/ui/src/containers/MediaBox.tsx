import { type Media } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { type serializedType } from "ts-io-error/lib/Codec";
import QueriesRenderer from "../components/QueriesRenderer";
import { MediaList } from "../components/lists/MediaList";
import { Box, Pagination } from "../components/mui";
import { type Endpoints } from "../providers/DataProvider";
import { useMediaQuery } from "../state/queries/media.queries";

export interface MediaBoxProps {
  filter: Partial<serializedType<typeof Endpoints.Media.List.Input.Query>>;
  onClick: (e: Media.Media) => void;
  limit?: number;
  perPage?: number;
  hideDescription?: boolean;
  disableZoom?: boolean;
  columns?: number;
}

export const MediaBox: React.FC<MediaBoxProps> = ({
  filter,
  limit,
  onClick,
  perPage = 20,
  ...props
}) => {
  const [page, setPage] = React.useState(1);
  const handlePageChange = (p: number): void => {
    setPage(p);
  };

  return (
    <QueriesRenderer
      queries={{
        media: useMediaQuery(
          {
            filter,
            pagination: {
              perPage: limit ?? perPage,
              page: limit ? 1 : page,
            },
          },
          false,
        ),
      }}
      render={({ media: { total, data: media } }) => {
        return (
          <Box style={{ height: "100%", width: "100%" }}>
            <Box
              style={{
                display: "flex",
                width: "100%",
              }}
            >
              <MediaList
                {...props}
                media={media.map((m) => ({ ...m, selected: true }))}
                onItemClick={onClick}
              />
            </Box>

            {!limit ? (
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
          </Box>
        );
      }}
    />
  );
};
