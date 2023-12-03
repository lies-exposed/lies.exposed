import React from "react";
import { Box } from "../../mui";
import { ReferenceManyField, useRecordContext } from "../react-admin";
import { SocialPostDataGrid } from "./SocialPostDatagrid";

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
