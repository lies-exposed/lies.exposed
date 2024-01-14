import {
  SocialPostResourceType,
  type SocialPost,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import * as React from "react";
import { useNavigateTo } from "../../../utils/history.utils.js";
import { Stack } from "../../mui/index.js";
import ReferenceActorInput from "../actors/ReferenceActorInput.js";
import ReferenceAreaInput from "../areas/input/ReferenceAreaInput.js";
import ReferenceEventInput from "../events/ReferenceEventInput.js";
import ReferenceGroupInput from "../groups/ReferenceGroupInput.js";
import ReferenceKeywordInput from "../keywords/ReferenceKeywordInput.js";
import ReferenceLinkInput from "../links/ReferenceLinkInput.js";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput.js";
import {
  Button,
  LoadingIndicator,
  SelectInput,
  TextInput,
  useRecordContext,
} from "../react-admin.js";

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
      <Button
        size="small"
        variant="contained"
        label={`Open ${record.type}`}
        onClick={handleResourceOpenClick}
      />
    </Stack>
  );
};
