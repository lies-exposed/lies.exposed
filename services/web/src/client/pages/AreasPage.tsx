import AreasMap from "@liexp/ui/components/AreasMap";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { AreaList } from "@liexp/ui/components/lists/AreaList";
import { useAreasQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Grid, useTheme } from "@mui/material";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";
import { AutoSizer } from "react-virtualized";
import { useNavigateToResource } from "../utils/location.utils";

const AreasPage: React.FC<RouteComponentProps> = ({ ...props }) => {
  const theme = useTheme();
  const navigateTo = useNavigateToResource();
  return (
    <QueriesRenderer
      queries={{
        areas: useAreasQuery({
          filter: null,
          pagination: { perPage: 10, page: 1 },
          sort: { field: "createdAt", order: "DESC" },
        }),
      }}
      render={({ areas: { data: areas } }) => {
        return (
          <AutoSizer defaultHeight={800}>
            {({ height, width }) => {
              return (
                <Grid container style={{ height, width }}>
                  <Grid item md={12}>
                    <PageContent path="areas" />
                  </Grid>
                  <Grid
                    item
                    md={9}
                    style={{
                      maxHeight: "100%",
                      paddingLeft: theme.spacing(2),
                      paddingRight: theme.spacing(2)
                    }}
                  >
                    <AreasMap
                      areas={areas}
                      height={height}
                      onMapClick={() => undefined}
                    />
                  </Grid>
                  <Grid
                    item
                    md={3}
                    style={{
                      maxHeight: "100%",
                      padding: theme.spacing(2),
                    }}
                  >
                    <AreaList
                      areas={areas.map((a) => ({ ...a, selected: false }))}
                      onAreaClick={(a) => {
                        navigateTo.areas({ id: a.id });
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "scroll",
                      }}
                    />
                  </Grid>
                </Grid>
              );
            }}
          </AutoSizer>
        );
      }}
    />
  );
};
export default AreasPage;
