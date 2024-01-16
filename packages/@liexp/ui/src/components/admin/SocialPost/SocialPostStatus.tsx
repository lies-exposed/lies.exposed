import * as SocialPost from "@liexp/shared/lib/io/http/SocialPost.js";
import * as React from "react";
import { Box } from "../../mui/index.js";
import { SelectInput } from "../react-admin.js";
import { PublishNowButton } from "./PublishNowButton.js";

export const SocialPostStatus: React.FC = () => {
  return (
    <Box style={{ display: "flex", alignItems: "center" }}>
      <SelectInput
        source="status"
        choices={SocialPost.SocialPostStatus.types.map((t) => ({
          id: t.value,
          name: t.value,
        }))}
      />
      <PublishNowButton platforms={{ IG: true, TG: true }} />
    </Box>
  );
};
