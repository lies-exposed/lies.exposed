import { MediaIcon } from "@liexp/ui/lib/components/Common/Icons";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@liexp/ui/lib/components/mui";
import * as React from "react";

export const AdminStats: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item md={4} sm={6}>
        <QueriesRenderer
          queries={(Q) => ({
            media: Q.Admin.Custom.GetOrphanMedia.useQuery(undefined),
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
                </CardContent>
              </Card>
            );
          }}
        />
      </Grid>
    </Grid>
  );
};
