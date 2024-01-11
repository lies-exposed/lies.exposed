import { ImageType } from "@liexp/shared/lib/io/http/Media";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils";
import * as React from "react";
import {
  Datagrid,
  DateInput,
  FormTab,
  LoadingPage,
  ReferenceManyField,
  TabbedForm,
  TextField,
  TextInput,
  usePermissions,
  useRecordContext,
} from "react-admin";
import { Grid, Stack, Toolbar } from "../../mui";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent";
import { DangerZoneField } from "../common/DangerZoneField";
import { EditForm } from "../common/EditForm";
import URLMetadataInput from "../common/URLMetadataInput";
import { CreateEventFromLinkButton } from "../events/CreateEventFromLinkButton";
import ReferenceArrayEventInput from "../events/ReferenceArrayEventInput";
import ReferenceManyEventField from "../events/ReferenceManyEventField";
import ReferenceGroupInput from "../groups/ReferenceGroupInput";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput";
import { MediaField } from "../media/MediaField";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput";
import LinkPreview from "../previews/LinkPreview";
import ReferenceUserInput from "../user/ReferenceUserInput";
import { EditTitle } from "./EditTitle";
import { LinkTGPostButton } from "./button/LinkTGPostButton";
import { OverrideThumbnail } from "./button/OverrideThumbnail";
import { TakeLinkScreenshot } from "./button/TakeLinkScreenshotButton";
import { UpdateMetadataButton } from "./button/UpdateMetadataButton";
import { transformLink } from "./transformLink";

export const LinkEdit: React.FC = () => {
  const record = useRecordContext();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoadingPermissions) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);

  return (
    <EditForm
      redirect={false}
      title={<EditTitle />}
      actions={
        <Toolbar>
          <UpdateMetadataButton />
          <LinkTGPostButton />
        </Toolbar>
      }
      preview={<LinkPreview record={record} />}
      transform={transformLink}
    >
      <TabbedForm>
        <FormTab label="General">
          <Grid container spacing={2}>
            <Grid item md={6}>
              <TextInput source="title" fullWidth />
              <URLMetadataInput source="url" type="Link" />
              <DateInput source="publishDate" />
              <MediaField
                source="image.thumbnail"
                sourceType="image/jpeg"
                controls={false}
              />
              <ReferenceMediaInput
                source="image.id"
                allowedTypes={ImageType.types.map((t) => t.value)}
              />
              <Stack direction={"row"} spacing={2}>
                <OverrideThumbnail />
                <TakeLinkScreenshot />
              </Stack>
              <TextInput source="description" fullWidth multiline />
              <ReferenceGroupInput source="provider" />
              {isAdmin && <DangerZoneField />}
            </Grid>
            <Grid item md={6}>
              <ReferenceArrayKeywordInput source="keywords" showAdd={true} />
              {isAdmin && <ReferenceUserInput source="creator" />}
            </Grid>
          </Grid>
        </FormTab>
        <FormTab label="Events">
          <Stack direction={"column"} spacing={2}>
            <ReferenceArrayEventInput source="events" target="ids" />
            <CreateEventFromLinkButton />
            <ReferenceArrayEventInput source="newEvents" defaultValue={[]} />
            <ReferenceManyEventField
              target="links[]"
              filter={{ withDrafts: true }}
            />
          </Stack>
        </FormTab>
        <FormTab label="Event Suggestions">
          <ReferenceManyField
            reference="events/suggestions"
            filter={{ links: record?.id ? [record.id] : [] }}
            target="links[]"
          >
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <TextField source="payload.event.payload.title" />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>
        <FormTab label="Social Posts">
          <SocialPostFormTabContent type="links" source="id" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};
