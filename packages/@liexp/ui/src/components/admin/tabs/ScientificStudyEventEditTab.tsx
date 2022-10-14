import { ScientificStudy } from '@liexp/shared/io/http/Events';
import * as React from "react";
import {
  EditProps, RaRecord, TextInput
} from "react-admin";
import { Box } from "../../mui";
import ReferenceArrayActorInput from "../common/ReferenceArrayActorInput";
import ReferenceGroupInput from '../common/ReferenceGroupInput';
import URLMetadataInput from '../common/URLMetadataInput';

export const ScientificStudyEventEditTab: React.FC<
  EditProps & { record?: RaRecord }
> = (props) => {
  return (
    <Box>
      <TextInput source="payload.title" fullWidth />
      <URLMetadataInput
        source="payload.url"
        type={ScientificStudy.SCIENTIFIC_STUDY.value}
      />
      <ReferenceGroupInput source="payload.publisher" />
      <ReferenceArrayActorInput source="payload.authors" />
    </Box>
  );
};