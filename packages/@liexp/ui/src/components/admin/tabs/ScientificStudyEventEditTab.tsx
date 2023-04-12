import { ScientificStudy } from '@liexp/shared/lib/io/http/Events';
import * as React from "react";
import {
  type EditProps, type RaRecord, TextInput
} from "react-admin";
import { Box } from "../../mui";
import ReferenceArrayActorInput from "../actors/ReferenceArrayActorInput";
import URLMetadataInput from '../common/URLMetadataInput';
import ReferenceGroupInput from '../groups/ReferenceGroupInput';

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