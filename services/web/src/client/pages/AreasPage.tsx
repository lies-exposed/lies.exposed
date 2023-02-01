import AreasMap from "@liexp/ui/components/AreasMap";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { AreaList } from "@liexp/ui/components/lists/AreaList";
import { Grid } from "@liexp/ui/components/mui";
import { useAreasQuery } from "@liexp/ui/state/queries/area.queries";
import { useTheme } from "@liexp/ui/theme";
import { type RouteComponentProps } from "@reach/router";
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
        }, false),
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
                      paddingRight: theme.spacing(2),
                    }}
                  >
                    <AreasMap
                      areas={areas}
                      height={height}
                      onMapClick={(features) => {
                        if (features.length > 0) {
                          const area = features[0].getProperties();
                          navigateTo.areas({ id: area.id });
                        }
                      }}
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
