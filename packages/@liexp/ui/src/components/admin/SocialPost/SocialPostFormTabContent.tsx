import * as React from "react";
import { Box } from "../../mui/index.js";
import { ReferenceManyField, useRecordContext } from "../react-admin.js";
import { SocialPostDataGrid } from "./SocialPostDatagrid.js";

export const SocialPostFormTabContent: React.FC<{
  source: string;
  target?: string;
  type?: string;
}> = ({ source, target = "entity", type }) => {
  const record = useRecordContext();
  if (!record) {
    return null;
  }

  return (
    <Box>
      <ReferenceManyField
        reference="social-posts"
        filter={{ type }}
        source={source}
        target={target}
      >
        <SocialPostDataGrid />
      </ReferenceManyField>
    </Box>
  );
};
