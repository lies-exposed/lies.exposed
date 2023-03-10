import { type Area, type Group } from "@liexp/shared/io/http";
import * as React from "react";
import MediaSliderBox from "../containers/MediaSliderBox";
import EditButton from "./Common/Button/EditButton";
import Editor from "./Common/Editor/index";
import { Box, Grid } from "./mui";

export interface AreaPageContentProps {
  area: Area.Area;
  onGroupClick: (g: Group.Group) => void;
}

export const AreaPageContent: React.FC<AreaPageContentProps> = ({ area }) => {
  return (
    <Grid container direction="column">
      <Grid item>
        <div style={{ textAlign: "right", margin: 10 }}>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton admin={true} resourceName="areas" resource={area} />
          </div>
        </div>
      </Grid>
      <Grid item>
        <Grid container direction="row">
          <Grid item md={12}>
            <>
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
            </>

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
