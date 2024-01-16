import { type Area, type Group } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import MediaSliderBox from "../containers/MediaSliderBox.js";
import { LazyEditor as Editor } from "./Common/Editor/index.js";
import { Box, Grid } from "./mui/index.js";

export interface AreaPageContentProps {
  area: Area.Area;
  onGroupClick: (g: Group.Group) => void;
}

export const AreaPageContent: React.FC<AreaPageContentProps> = ({ area }) => {
  return (
    <Grid container direction="column">
      <Grid item md={12}>
        <>
          <MediaSliderBox
            itemStyle={(i) => ({
              display: "block",
              height: "100%",
              width: "100%",
            })}
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
  );
};
