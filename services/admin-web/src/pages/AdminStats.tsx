import { MediaIcon } from "@liexp/ui/lib/components/Common/Icons";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  Button,
  Card,
  CardActions,
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
          render={({ media: { data: media } }) => {
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
                    <Typography>Orphan:</Typography>
                    <Typography variant="h6">{media.length}</Typography>
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button>Clear</Button>
                </CardActions>
              </Card>
            );
          }}
        />
      </Grid>
    </Grid>
  );
};
