import { type Area } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { AutoSizer } from "react-virtualized";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import AreasMap from "../../components/area/AreasMap.js";
import { AreaList } from "../../components/lists/AreaList.js";
import { Box, Grid } from "../../components/mui/index.js";

interface ExploreAreasBoxProps {
  onAreaClick: (a: Area.Area) => void;
}

export const ExploreAreasBox: React.FC<ExploreAreasBoxProps> = ({
  onAreaClick,
}) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        areas: Q.Area.list.useQuery(
          {
            filter: null,
          },
          undefined,
          false,
        ),
      })}
      render={({ areas: { data: areas } }) => {
        return (
          <AutoSizer
            defaultHeight={600}
            style={{ width: "100%", height: "100%" }}
          >
            {({ width, height }) => {
              const innerHeight = height - height * 0.2;
              return (
                <Grid
                  container
                  spacing={2}
                  style={{ height: innerHeight, width: "100%" }}
                >
                  <Grid item md={8}>
                    <Box style={{ width: "100%", maxHeight: "100%" }}>
                      <AreasMap
                        areas={areas}
                        height={height * (2 / 3)}
                        onMapClick={(features) => {
                          if (features.length > 0) {
                            const area: any = features[0].getProperties();
                            onAreaClick(area);
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid
                    item
                    md={4}
                    style={{ height: innerHeight, overflow: "auto" }}
                  >
                    <AreaList
                      areas={areas.map((a) => ({ ...a, selected: false }))}
                      onAreaClick={onAreaClick}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
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
