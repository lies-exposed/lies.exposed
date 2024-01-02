import { MediaIcon } from "@liexp/ui/lib/components/Common/Icons";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  Box,
  Card,
  CardContent,
  Grid,
  List,
  Stack,
  Typography,
} from "@liexp/ui/lib/components/mui";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

export const AdminStats: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item md={4} sm={6}>
        <QueriesRenderer
          queries={(Q) => ({
            media: Q.Admin.Custom.GetMediaStats.useQuery(undefined),
          })}
          render={({ media: { data, total } }) => {
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
                    <Typography variant="h5">Media</Typography>
                  </Stack>

                  <Stack
                    alignContent={"center"}
                    alignItems={"center"}
                    direction="row"
                    spacing={2}
                  >
                    <Typography>Orphans:</Typography>
                    <Typography variant="h6">{data.orphans.length}</Typography>
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
                          pipe(
                            t.fileSize,
                            (tot) => tot / (1024 * 1024),
                            Math.ceil,
                          ),
                        ])
                        .sort(([, a], [, b]) => b - a)
                        .map(([t, size]) => {
                          const color =
                            size > 1000
                              ? "error"
                              : size > 500
                                ? "primary"
                                : undefined;
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
          }}
        />
      </Grid>
    </Grid>
  );
};
