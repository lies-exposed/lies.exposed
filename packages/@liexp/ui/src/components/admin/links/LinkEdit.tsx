import { ImageType } from "@liexp/io/lib/http/Media/MediaType.js";
import { OpenAIEmbeddingQueueType } from "@liexp/io/lib/http/Queue/index.js";
import { Link } from "@liexp/io/lib/http/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/auth.utils.js";
import * as React from "react";
import { Grid, Stack, Toolbar } from "../../mui/index.js";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import { DangerZoneField } from "../common/DangerZoneField.js";
import { EditForm } from "../common/EditForm.js";
import URLMetadataInput from "../common/URLMetadataInput.js";
import { CreateEventFromLinkButton } from "../events/CreateEventFromLinkButton.js";
import { CreateEventFromURLQueueButton } from "../events/CreateEventFromURLQueueButton.js";
import ReferenceArrayEventInput from "../events/ReferenceArrayEventInput.js";
import ReferenceManyEventField from "../events/ReferenceManyEventField.js";
import ReferenceGroupInput from "../groups/ReferenceGroupInput.js";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput.js";
import { MediaField } from "../media/MediaField.js";
import { OpenAIEmbeddingJobButton } from "../media/OpenAIJobButton.js";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput.js";
import LinkPreview from "../previews/LinkPreview.js";
import {
  Datagrid,
  DateInput,
  LoadingPage,
  ReferenceManyField,
  SelectInput,
  TabbedForm,
  TextField,
  TextInput,
  usePermissions,
  useRecordContext,
} from "../react-admin.js";
import { EditToolbar } from "../toolbar/index.js";
import ReferenceUserInput from "../user/ReferenceUserInput.js";
import { EditTitle } from "./EditTitle.js";
import { LinkSuggestedEntityRelations } from "./LinkSuggestedEntityRelations.js";
import { LinkTGPostButton } from "./button/LinkTGPostButton.js";
import { OverrideThumbnail } from "./button/OverrideThumbnail.js";
import { TakeLinkScreenshot } from "./button/TakeLinkScreenshotButton.js";
import { transformLink } from "./transformLink.js";

const LinkStatusInput: React.FC = () => {
  return (
    <SelectInput
      source="status"
      choices={Link.Status.members.map((l) => l.literals[0])}
    />
  );
};

export const LinkEdit: React.FC = () => {
  const record = useRecordContext<Link.Link>();
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
          <Stack direction="row" spacing={2} padding={2}>
            <LinkTGPostButton />
          </Stack>
        </Toolbar>
      }
      preview={<LinkPreview record={record} />}
      transform={transformLink}
    >
      <TabbedForm toolbar={<EditToolbar />}>
        <TabbedForm.Tab label="General">
          <Grid container spacing={2}>
            <Grid size={{ md: 6 }}>
              <TextInput source="title" fullWidth />
              <LinkStatusInput />
              <URLMetadataInput source="url" type="Link" />
              <DateInput source="publishDate" />
              <MediaField
                source="image.thumbnail"
                sourceType="image/jpeg"
                controls={false}
              />
              <ReferenceMediaInput
                source="image.id"
                allowedTypes={ImageType.members.map((t) => t.literals[0])}
              />
              <Stack direction={"row"} spacing={2}>
                <OverrideThumbnail />
                <TakeLinkScreenshot />
              </Stack>
              <Stack>
                <OpenAIEmbeddingJobButton<Link.Link>
                  resource="links"
                  type={OpenAIEmbeddingQueueType.Type}
                  label="Extract Title & Description"
                  description="AI will browse the link and extract its title, description, and publish date"
                  transformValue={({ url }) => ({
                    url,
                    type: "link",
                  })}
                />
                <TextInput source="description" fullWidth multiline />
              </Stack>
              <ReferenceGroupInput source="provider" />
              {isAdmin && <DangerZoneField />}
            </Grid>
            <Grid size={{ md: 6 }}>
              <ReferenceArrayKeywordInput source="keywords" showAdd={true} />
              {isAdmin && <ReferenceUserInput source="creator" />}
              <LinkSuggestedEntityRelations />
            </Grid>
          </Grid>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Events">
          <Stack direction={"column"} spacing={2}>
            <CreateEventFromURLQueueButton />
            <CreateEventFromLinkButton />
            <ReferenceArrayEventInput source="newEvents" defaultValue={[]} />
            <ReferenceManyEventField
              target="links[]"
              filter={{ withDrafts: true }}
            />
          </Stack>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Event Suggestions">
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
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Social Posts">
          <SocialPostFormTabContent type="links" source="id" />
        </TabbedForm.Tab>
      </TabbedForm>
    </EditForm>
  );
};
