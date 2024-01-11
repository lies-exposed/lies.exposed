import { type Area } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { AutoSizer } from "react-virtualized";
import AreasMap from "../components/AreasMap";
import { AutocompleteAreaInput } from "../components/Input/AutocompleteAreaInput";
import QueriesRenderer from "../components/QueriesRenderer";
import { AreaList } from "../components/lists/AreaList";
import { Box, Container, Grid } from "../components/mui";
import { PageContentBox } from "../containers/PageContentBox";
import { useTheme } from "../theme";

export interface SearchAreaTemplateProps {
  onAreaClick: (a: Area.Area) => void;
}

const SearchAreaTemplate: React.FC<SearchAreaTemplateProps> = ({
  onAreaClick,
}) => {
  const theme = useTheme();
  return (
    <Container style={{ height: innerHeight, width: "100%" }}>
      <PageContentBox path="areas" />
      <AutocompleteAreaInput
        selectedItems={[]}
        onChange={(a) => {
          if (Array.isArray(a) && a[0]) {
            onAreaClick(a[0]);
          }
        }}
        discrete={true}
      />
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
                return (
                  <Grid container style={{ height, width: "100%" }}>
                    <Grid item md={12}>
                      <PageContentBox path="areas" />
                    </Grid>

                    <Grid
                      item
                      md={8}
                      style={{
                        paddingLeft: theme.spacing(2),
                        paddingRight: theme.spacing(2),
                      }}
                    >
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
                      style={{
                        maxHeight: "100%",
                        padding: theme.spacing(2),
                      }}
                    >
                      <AreaList
                        areas={areas.map((a) => ({ ...a, selected: false }))}
                        onAreaClick={onAreaClick}
                        style={{
                          display: "flex",
                          flexDirection: "column",
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
    </Container>
  );
};
export default SearchAreaTemplate;
