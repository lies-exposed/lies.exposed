import { type Actor } from "@liexp/shared/lib/io/http";
import * as React from "react";
import {
  Error,
  Loading,
  TextField,
  TextInput,
  useGetOne,
  useRecordContext,
  type EditProps,
} from "react-admin";
import { Box } from "../../../mui";
import ReferenceActorInput from "../../actors/ReferenceActorInput";

export const QuoteEditFormTab: React.FC<EditProps & { record?: any }> = (
  props,
) => {
  const record = useRecordContext();

  const {
    data: actor,
    isLoading,
    error,
  } = useGetOne<Actor.Actor>("actors", { id: record?.payload?.actor });

  if (isLoading) return <Loading />;
  if (error)
    return <Error error={error as any} resetErrorBoundary={() => {}} />;
  if (!actor) return null;

  // const imageText = record?.payload?.quote
  //   ? `"${record.payload.quote}"\n\n${actor.fullName}${
  //       record.payload.details ? ` - ${record.payload.details}` : ""
  //     }`
  //   : "";
  // const actorAvatar = actor.avatar ?? defaultImage;

  return (
    <Box>
      <ReferenceActorInput source="payload.actor" />
      <TextInput source="payload.details" fullWidth />
      <TextField source="payload.quote" fullWidth />
    </Box>
  );
};
