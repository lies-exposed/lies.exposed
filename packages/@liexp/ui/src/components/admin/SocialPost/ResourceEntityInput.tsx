import {
  SocialPostResourceType,
  type SocialPost,
} from "@liexp/shared/lib/io/http/SocialPost";
import * as React from "react";
import { useNavigateTo } from '../../../utils/history.utils';
import { Stack } from "../../mui";
import ReferenceActorInput from "../actors/ReferenceActorInput";
import ReferenceAreaInput from "../common/ReferenceAreaInput";
import ReferenceEventInput from "../events/ReferenceEventInput";
import ReferenceGroupInput from "../groups/ReferenceGroupInput";
import ReferenceKeywordInput from '../keywords/ReferenceKeywordInput';
import ReferenceLinkInput from "../links/ReferenceLinkInput";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput";
import {
  Button,
  LoadingIndicator,
  SelectInput,
  TextInput,
  useRecordContext,
} from "../react-admin";

export const ResourceEntityInput: React.FC = () => {
  const record = useRecordContext<SocialPost>();
  const navigation = useNavigateTo();
  if (!record) {
    return <LoadingIndicator />;
  }

  const referenceInput = React.useMemo(() => {
    if (record.type === SocialPostResourceType.types[0].value) {
      return <ReferenceActorInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.types[1].value) {
      return <ReferenceGroupInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.types[2].value) {
      return <ReferenceKeywordInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.types[3].value) {
      return <ReferenceMediaInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.types[4].value) {
      return <ReferenceEventInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.types[5].value) {
      return <ReferenceLinkInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.types[6].value) {
      return <ReferenceAreaInput source="entity" />;
    }

    return <TextInput source="entity" />;
  }, [record.type]);

  const handleResourceOpenClick = React.useCallback(() => {
    navigation.navigate(`/${record.type}/${record.entity}`);
  }, [record.type]);

  return (
    <Stack direction={"row"} spacing={2}>
      <SelectInput
        source="type"
        choices={SocialPostResourceType.types.map((t) => ({
          id: t.value,
          name: t.value,
        }))}
      />
      {referenceInput}
      <Button size='small' variant='contained' label={`Open ${record.type}`} onClick={handleResourceOpenClick} />
    </Stack>
  );
};
