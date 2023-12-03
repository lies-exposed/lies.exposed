import * as SocialPost from "@liexp/shared/lib/io/http/SocialPost";
import * as React from "react";
import { Box } from "../../mui";
import { SelectInput } from "../react-admin";
import { PublishNowButton } from "./PublishNowButton";

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
