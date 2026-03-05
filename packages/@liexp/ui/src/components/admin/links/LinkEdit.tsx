import { ImageType } from "@liexp/io/lib/http/Media/MediaType.js";
import { OpenAIEmbeddingQueueType } from "@liexp/io/lib/http/Queue/index.js";
import { Link } from "@liexp/io/lib/http/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/auth.utils.js";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { PersonIcon } from "../../mui/icons.js";
import {
  Box,
  Grid,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  IconButton,
} from "../../mui/index.js";
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
  useGetIdentity,
  useNotify,
  usePermissions,
  useRecordContext,
  useRefresh,
  useUpdate,
} from "../react-admin.js";
import { EditToolbar } from "../toolbar/index.js";
import ReferenceUserInput from "../user/ReferenceUserInput.js";
import { EditTitle } from "./EditTitle.js";
import { LinkSuggestedEntityRelations } from "./LinkSuggestedEntityRelations.js";
import { ApproveLinkButton } from "./button/ApproveLinkButton.js";
import { LinkTGPostButton } from "./button/LinkTGPostButton.js";
import { OverrideThumbnail } from "./button/OverrideThumbnail.js";
import { TakeLinkScreenshot } from "./button/TakeLinkScreenshotButton.js";
import { transformLink } from "./transformLink.js";

const SetMeAsAuthorButton: React.FC = () => {
  const { identity, isLoading: isLoadingIdentity } = useGetIdentity();
  const record = useRecordContext();
  const { setValue } = useFormContext();
  const [update, { isPending }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();

  if (isLoadingIdentity || !identity || !record) {
    return null;
  }

  const isAlreadyAuthor = record.creator === identity.id;

  const handleClick = () => {
    setValue("creator", identity.id, { shouldDirty: true });
    void update(
      "links",
      {
        id: record.id,
        data: {
          ...record,
          image: (record.image as any)?.id,
          creator: identity.id,
        },
        previousData: record,
      },
      {
        onSuccess: () => {
          notify("You are now set as the author", { type: "success" });
          refresh();
        },
        onError: () => {
          notify("Failed to set author", { type: "error" });
        },
      },
    );
  };

  return (
    <Tooltip
      title={
        isAlreadyAuthor ? "You are already the author" : "Set me as author"
      }
    >
      <span>
        <IconButton
          size="small"
          color="primary"
          disabled={isPending || isAlreadyAuthor}
          onClick={handleClick}
          aria-label="Set me as author"
        >
          <PersonIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
};

const LinkStatusSection: React.FC = () => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Status
      </Typography>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <SelectInput
          source="status"
          choices={Link.Status.members.map((l) => ({
            id: l.literals[0],
            name: l.literals[0],
          }))}
        />
        <Box sx={{ pt: 1 }}>
          <ApproveLinkButton />
        </Box>
      </Stack>
    </Box>
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
              <LinkStatusSection />
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
              {isAdmin && (
                <Stack direction="row" spacing={1} alignItems="flex-end">
                  <Box sx={{ flexGrow: 1 }}>
                    <ReferenceUserInput source="creator" />
                  </Box>
                  <Box sx={{ pb: 1 }}>
                    <SetMeAsAuthorButton />
                  </Box>
                </Stack>
              )}
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
