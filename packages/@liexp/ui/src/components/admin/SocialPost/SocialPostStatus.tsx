import * as SocialPost from "@liexp/shared/lib/io/http/SocialPost.js";
import * as React from "react";
import { Box, Stack } from "../../mui/index.js";
import { SelectInput, useRecordContext } from "../react-admin.js";
import { PublishNowButton } from "./PublishNowButton.js";

export const SocialPostStatus: React.FC = () => {
  const record = useRecordContext();
  return (
    <Stack
      direction="row"
      alignContent={"center"}
      justifyContent={"center"}
      justifyItems={"center"}
      spacing={2}
    >
      <SelectInput
        size="small"
        source="status"
        choices={SocialPost.SocialPostStatus.members.map((t) => ({
          id: t.literals[0],
          name: t.literals[0],
        }))}
      />
      <Box>
        <PublishNowButton
          platforms={record?.platforms ?? { IG: false, TG: true }}
        />
      </Box>
    </Stack>
  );
};
