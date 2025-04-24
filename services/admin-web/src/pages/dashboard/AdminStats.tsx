import {
  type AdminMediaStats,
  type AdminMediaStatsTotals,
} from "@liexp/shared/lib/io/http/admin/stats/AdminMediaStats.js";
import {
  LinkIcon,
  MediaIcon,
} from "@liexp/ui/lib/components/Common/Icons/index.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  Box,
  Card,
  CardContent,
  Grid,
  List,
  Stack,
  Typography,
} from "@liexp/ui/lib/components/mui/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useNavigate } from "react-router";

export const AdminStats: React.FC = () => {
  const navigate = useNavigate();

  const onNoThumbnailsClick = React.useCallback(
    (resource: string) => () => {
      navigate(
        `/${resource}?filter=${JSON.stringify({ emptyThumbnail: true })}`,
      );
    },
    [],
  );

  const onNeedRegenerateThumbnailClick = React.useCallback(
    (resource: string) => () => {
      navigate(
        `/${resource}?filter=${JSON.stringify({
          needRegenerateThumbnail: true,
        })}`,
      );
    },
    [],
  );

  const onNoPublishDateClick = React.useCallback(
    (resource: string) => () => {
      navigate(
        `/${resource}?filter=${JSON.stringify({ noPublishDate: true })}`,
      );
    },
    [],
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ md: 4, sm: 6 }}>
        <QueriesRenderer
          queries={(Q) => ({
            media: Q.Admin.Custom.GetMediaStats.useQuery(undefined),
            links: Q.Admin.Custom.GetLinkStats.useQuery(undefined),
          })}
          render={({ media, links }) => {
            return (
              <Stack>
                <MediaStatsCard
                  onNoThumbnailsClick={onNoThumbnailsClick("media")}
                  onRegenerateThumbnailClick={onNeedRegenerateThumbnailClick(
                    "media",
                  )}
                  data={media.data}
                  total={media.total}
                  totals={media.totals}
                />
                <LinksStatsCard
                  onNoThumbnailsClick={onNoThumbnailsClick("links")}
                  onNoPublishDateClick={onNoPublishDateClick("links")}
                  total={links.total}
                  totals={links.totals}
                />
              </Stack>
            );
          }}
        />
      </Grid>
    </Grid>
  );
};

const MediaStatsCard: React.FC<{
  onNoThumbnailsClick: () => void;
  onRegenerateThumbnailClick: () => void;
  data: AdminMediaStats;
  total: number;
  totals: AdminMediaStatsTotals;
}> = ({
  data,
  total,
  totals,
  onNoThumbnailsClick,
  onRegenerateThumbnailClick,
}) => {
  return (
    <Card>
      <CardContent>
        <Stack
          alignContent={"center"}
          alignItems={"center"}
          direction="row"
          spacing={2}
        >
          <MediaIcon />
          <Typography variant="h5">Media ({total})</Typography>
        </Stack>

        <Stack
          alignContent={"center"}
          alignItems={"center"}
          direction="row"
          spacing={2}
        >
          <Typography>Need Thumbnail Regeneration:</Typography>
          <Typography variant="h6" onClick={onRegenerateThumbnailClick}>
            {totals.needRegenerateThumbnail}
          </Typography>
        </Stack>

        <Stack
          alignContent={"center"}
          alignItems={"center"}
          direction="row"
          spacing={2}
        >
          <Typography>No Thumbnails:</Typography>
          <Typography variant="h6" onClick={onNoThumbnailsClick}>
            {totals.noThumbnails}
          </Typography>
        </Stack>

        <Stack
          alignContent={"center"}
          alignItems={"center"}
          direction="row"
          spacing={2}
        >
          <Typography>Orphans:</Typography>
          <Typography variant="h6">{totals.orphans}</Typography>
        </Stack>
        <Stack
          alignContent={"center"}
          alignItems={"center"}
          direction="row"
          spacing={2}
        >
          <Typography>Linked:</Typography>
          <Typography variant="h6">{data.match.length}</Typography>
        </Stack>
        <Stack>
          <Stack
            alignContent={"center"}
            alignItems={"center"}
            direction="row"
            spacing={2}
          >
            <Typography>Temp:</Typography>
            <Typography variant="h6">
              {data.temp.length} (
              {pipe(
                data.temp.reduce((acc, t) => acc + t.fileSize, 0),
                (tot) => tot / (1024 * 1024),
                Math.ceil,
              )}
              Mb)
            </Typography>
          </Stack>
          <List>
            {data.temp
              .map((t) => [
                t,
                pipe(t.fileSize, (tot) => tot / (1024 * 1024), Math.ceil),
              ])
              .sort(([, a], [, b]) => b - a)
              .map(([t, size]) => {
                const color =
                  size > 1000 ? "error" : size > 500 ? "primary" : undefined;
                return (
                  <Box key={t.fileRelativePath}>
                    <Typography variant="caption" color={color}>
                      {t.fileRelativePath} ({size}Mb)
                    </Typography>
                  </Box>
                );
              })}
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
};

const LinksStatsCard: React.FC<{
  onNoThumbnailsClick: () => void;
  onNoPublishDateClick: () => void;
  total: number;
  totals: { noThumbnails: number; noPublishDate: number };
}> = ({ total, totals, onNoThumbnailsClick, onNoPublishDateClick }) => {
  return (
    <Card>
      <CardContent>
        <Stack
          alignContent={"center"}
          alignItems={"center"}
          direction="row"
          spacing={2}
        >
          <LinkIcon />
          <Typography variant="h5">Links ({total})</Typography>
        </Stack>

        <Stack
          alignContent={"center"}
          alignItems={"center"}
          direction="row"
          spacing={2}
          onClick={onNoThumbnailsClick}
        >
          <Typography>No Thumbnails:</Typography>
          <Typography variant="h6">{totals.noThumbnails}</Typography>
        </Stack>

        <Stack
          alignContent={"center"}
          alignItems={"center"}
          direction="row"
          spacing={2}
          onClick={onNoPublishDateClick}
        >
          <Typography>No Publish Date:</Typography>
          <Typography variant="h6">{totals.noPublishDate}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
