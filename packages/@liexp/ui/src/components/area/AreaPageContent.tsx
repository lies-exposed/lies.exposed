import { type Area, type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import MediaSliderBox from "../../containers/MediaSliderBox.js";
import { paginationToParams } from "../../utils/params.utils.js";
import { BNEditor } from "../Common/BlockNote/index.js";
import { Box, Grid } from "../mui/index.js";

export interface AreaPageContentProps {
  area: Area.Area;
  onMediaClick: (m: Media.Media) => void;
}

export const AreaPageContent: React.FC<AreaPageContentProps> = ({
  area,
  onMediaClick,
}) => {
  return (
    <Grid container>
      <Grid size={{ md: 12 }}>
        <Box
          sx={() => ({
            py: 2,
          })}
        >
          {typeof area.body === "string" ? (
            <div>{area.body}</div>
          ) : (
            <BNEditor content={area.body} readOnly />
          )}
        </Box>
        <MediaSliderBox
          itemStyle={(i) => ({
            display: "block",
            height: "100%",
            width: "100%",
          })}
          query={{
            ids: area.media,
            ...paginationToParams({ page: 1, perPage: 10 }),
            _sort: "createdAt",
            _order: "DESC",
          }}
          onClick={onMediaClick}
        />
      </Grid>
    </Grid>
  );
};
