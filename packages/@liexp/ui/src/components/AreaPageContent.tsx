import { Area, Group } from "@liexp/shared/io/http";
import Feature from "ol/Feature";
import * as React from "react";
import MediaSliderBox from "../containers/MediaSliderBox";
import { geoJSONFormat } from "../utils/map.utils";
import EditButton from "./Common/Button/EditButton";
import Editor from "./Common/Editor/index";
import Map from "./Map";
import { Box, Grid, Typography } from "./mui";

export interface AreaPageContentProps {
  area: Area.Area;
  onGroupClick: (g: Group.Group) => void;
}

export const AreaPageContent: React.FC<AreaPageContentProps> = ({ area }) => {
  const { features } = React.useMemo(() => {
    if (area) {
      const features = [area].map(({ geometry, ...datum }) => {
        const geom = geoJSONFormat.readGeometry(geometry);
        const feature = new Feature(geom);
        feature.setProperties(datum);
        return feature;
      });
      // const totalArea = calculateAreaInSQM([area]);
      return { features };
    }
    return { features: [] };
  }, []);

  return (
    <Grid container direction="column">
      <Grid item>
        <div style={{ textAlign: "right", margin: 10 }}>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="areas" resource={area} />
          </div>
        </div>
        <Typography variant="h3">{area.label}</Typography>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item md={3}>
            <Map
              id={`area-${area.id}`}
              width={200}
              height={200}
              features={features}
              center={[9.18951, 45.46427]}
              zoom={12}
              onMapClick={() => {}}
              controls={{
                zoom: false,
              }}
            />
          </Grid>
          <Grid item md={9}>
            <MediaSliderBox
              query={{
                filter: { ids: area.media },
                pagination: {
                  perPage: 10,
                  page: 1,
                },
                sort: {
                  field: "createdAt",
                  order: "DESC",
                },
              }}
              onClick={() => {}}
            />
            <Box
              sx={() => ({
                py: 2,
              })}
            >
              {typeof area.body === "string" ? (
                <div>{area.body}</div>
              ) : (
                <Editor value={area.body as any} readOnly />
              )}
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
