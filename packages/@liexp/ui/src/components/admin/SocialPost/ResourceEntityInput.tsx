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
    if (record.type === SocialPostResourceType.members[0].Type) {
      return <ReferenceActorInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.members[1].Type) {
      return <ReferenceGroupInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.members[2].Type) {
      return <ReferenceKeywordInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.members[3].Type) {
      return <ReferenceMediaInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.members[4].Type) {
      return <ReferenceEventInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.members[5].Type) {
      return <ReferenceLinkInput source="entity" />;
    }

    if (record.type === SocialPostResourceType.members[6].Type) {
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
        choices={SocialPostResourceType.members.map((t) => ({
          id: t.Type,
          name: t.Type,
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
