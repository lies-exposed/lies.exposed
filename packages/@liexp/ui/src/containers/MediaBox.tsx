import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { type serializedType } from "ts-io-error/lib/Codec.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { MediaList } from "../components/lists/MediaList.js";
import { Box, Pagination } from "../components/mui/index.js";

export interface MediaBoxProps {
  filter: Partial<serializedType<typeof Endpoints.Media.List.Input.Query>>;
  onClick: (e: Media.Media) => void;
  limit?: number;
  perPage?: number;
  hideDescription?: boolean;
  disableZoom?: boolean;
  columns?: number;
  discrete?: boolean;
}

export const MediaBox: React.FC<MediaBoxProps> = ({
  filter,
  limit,
  onClick,
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
            filter,
            pagination: {
              perPage: limit ?? perPage,
              page: limit ? 1 : page,
            },
          },
          undefined,
          discrete,
        ),
      })}
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
