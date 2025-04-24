import {
  AudioType,
  PDFType,
} from "@liexp/shared/lib/io/http/Media/MediaType.js";
import * as React from "react";
import { TextInput } from "react-admin";
import { Box, Grid, Stack } from "../../../mui/index.js";
import ReferenceArrayBySubjectInput from "../../common/inputs/BySubject/ReferenceArrayBySubjectInput.js";
import ReferenceBySubjectInput from "../../common/inputs/BySubject/ReferenceBySubjectInput.js";
import ReferenceMediaInput from "../../media/input/ReferenceMediaInput.js";

export const BookEditFormTab: React.FC = () => {
  return (
    <Box>
      <TextInput source="payload.title" fullWidth />
      <ReferenceMediaInput
        source="payload.media.pdf"
        allowedTypes={[PDFType.literals[0]]}
      />
      <ReferenceMediaInput
        source="payload.media.audio"
        allowedTypes={AudioType.members.map((t) => t.literals[0])}
      />
      <Stack spacing={2}>
        <Grid container direction={"row"} alignItems={"center"}>
          <Grid columns={6}>
            <ReferenceArrayBySubjectInput source="payload.authors" />
          </Grid>
          <Grid columns={6}>
            <ReferenceBySubjectInput source="payload.publisher" />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};
