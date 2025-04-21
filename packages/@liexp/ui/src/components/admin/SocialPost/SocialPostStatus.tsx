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
        choices={SocialPost.SocialPostStatus.members.map((t) => ({
          id: t.literals[0],
          name: t.literals[0],
        }))}
      />
      <PublishNowButton platforms={{ IG: true, TG: true }} />
    </Box>
  );
};
