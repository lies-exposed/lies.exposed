import { type Link } from "@liexp/shared/lib/io/http/Link.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { OpenAIEmbeddingQueueType } from "@liexp/shared/lib/io/http/Queue/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/auth.utils.js";
import * as React from "react";
import { Grid, Stack, Toolbar } from "../../mui/index.js";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import { DangerZoneField } from "../common/DangerZoneField.js";
import { EditForm } from "../common/EditForm.js";
import URLMetadataInput from "../common/URLMetadataInput.js";
import { CreateEventFromLinkButton } from "../events/CreateEventFromLinkButton.js";
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
  TabbedForm,
  TextField,
  TextInput,
  usePermissions,
  useRecordContext,
} from "../react-admin.js";
import ReferenceUserInput from "../user/ReferenceUserInput.js";
import { EditTitle } from "./EditTitle.js";
import { LinkSuggestedEntityRelations } from "./LinkSuggestedEntityRelations.js";
import { LinkTGPostButton } from "./button/LinkTGPostButton.js";
import { OverrideThumbnail } from "./button/OverrideThumbnail.js";
import { TakeLinkScreenshot } from "./button/TakeLinkScreenshotButton.js";
import { UpdateMetadataButton } from "./button/UpdateMetadataButton.js";
import { transformLink } from "./transformLink.js";

export const LinkEdit: React.FC = () => {
  const record = useRecordContext<Link>();
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
          <Stack direction="row" spacing={2}>
            <UpdateMetadataButton />
            <LinkTGPostButton />
          </Stack>
        </Toolbar>
      }
      preview={<LinkPreview record={record} />}
      transform={transformLink}
    >
      <TabbedForm>
        <TabbedForm.Tab label="General">
          <Grid container spacing={2}>
            <Grid size={{ md: 6 }}>
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
                allowedTypes={ImageType.members.map((t) => t.literals[0])}
              />
              <Stack direction={"row"} spacing={2}>
                <OverrideThumbnail />
                <TakeLinkScreenshot />
              </Stack>
              <Stack>
                <OpenAIEmbeddingJobButton<Link>
                  resource="links"
                  type={OpenAIEmbeddingQueueType.Type}
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
