import {
  SocialPostResourceType,
  type SocialPost,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import * as React from "react";
import { Box, Stack } from "../../mui/index.js";
import ReferenceActorInput from "../actors/ReferenceActorInput.js";
import ReferenceAreaInput from "../areas/input/ReferenceAreaInput.js";
import ReferenceEventInput from "../events/ReferenceEventInput.js";
import ReferenceGroupInput from "../groups/ReferenceGroupInput.js";
import ReferenceKeywordInput from "../keywords/ReferenceKeywordInput.js";
import ReferenceLinkInput from "../links/ReferenceLinkInput.js";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput.js";
import {
  LoadingIndicator,
  SelectInput,
  TextInput,
  useRecordContext,
} from "../react-admin.js";

export const ResourceEntityInput: React.FC = () => {
  const record = useRecordContext<SocialPost>();

  if (!record) {
    return <LoadingIndicator />;
  }

  const referenceInput = React.useMemo(() => {
    const commonProps = {
      size: "small" as const,
      source: "entity",
    };
    if (record.type === SocialPostResourceType.members[0].literals[0]) {
      return <ReferenceActorInput {...commonProps} />;
    }

    if (record.type === SocialPostResourceType.members[1].literals[0]) {
      return <ReferenceGroupInput {...commonProps} />;
    }

    if (record.type === SocialPostResourceType.members[2].literals[0]) {
      return <ReferenceKeywordInput {...commonProps} />;
    }

    if (record.type === SocialPostResourceType.members[3].literals[0]) {
      return <ReferenceMediaInput {...commonProps} />;
    }

    if (record.type === SocialPostResourceType.members[4].literals[0]) {
      return <ReferenceEventInput {...commonProps} />;
    }

    if (record.type === SocialPostResourceType.members[5].literals[0]) {
      return <ReferenceLinkInput {...commonProps} />;
    }

    if (record.type === SocialPostResourceType.members[6].literals[0]) {
      return <ReferenceAreaInput {...commonProps} />;
    }

    return <TextInput {...commonProps} />;
  }, [record.type]);

  return (
    <Stack direction={"row"} spacing={2} width={"100%"} alignItems={"center"}>
      <SelectInput
        size="small"
        source="type"
        choices={SocialPostResourceType.members.map((t) => ({
          id: t.literals[0],
          name: t.literals[0],
        }))}
      />
      <Box>{referenceInput}</Box>
    </Stack>
  );
};
