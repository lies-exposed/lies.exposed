import {
  ImageType,
  TransferableType,
  type Media,
} from "@liexp/shared/lib/io/http/Media/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as React from "react";
import {
  DateField,
  DeleteButton,
  DeleteWithConfirmButton,
  FormDataConsumer,
  FormTab,
  LoadingPage,
  SaveButton,
  TabbedForm,
  TextInput,
  useEditController,
  usePermissions,
  useRecordContext,
  useRefresh,
  type EditProps,
  type FieldProps,
  ToolbarClasses,
  Toolbar,
} from "react-admin";
import { transformMedia } from "../../../client/admin/MediaAPI.js";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Box, Button, Grid, Stack, alpha } from "../../mui/index.js";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import ReferenceAreaTab from "../areas/ReferenceAreaTab.js";
import { EditForm } from "../common/EditForm.js";
import { CreateEventFromMediaButton } from "../events/CreateEventFromMediaButton.js";
import ReferenceArrayEventInput from "../events/ReferenceArrayEventInput.js";
import ReferenceManyEventField from "../events/ReferenceManyEventField.js";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput.js";
import MediaPreview from "../previews/MediaPreview.js";
import { ReferenceLinkTab } from "../tabs/ReferenceLinkTab.js";
import ReferenceUserInput from "../user/ReferenceUserInput.js";
import { MediaField } from "./MediaField.js";
import { MediaSuggestedEntityRelations } from "./MediaSuggestedEntityRelations.js";
import { OpenAIEmbeddingJobButton } from "./OpenAIJobButton.js";
import { GenerateExtraButton } from "./button/GenerateExtraButton.js";
import { GenerateThumbnailButton } from "./button/GenerateThumbnailButton.js";
import { MediaTGPostButton } from "./button/MediaTGPostButton.js";
import { MediaInput } from "./input/MediaInput.js";

const EditTitle: React.FC<EditProps<Media>> = ({ record }) => {
  return <span>Media {record?.description}</span>;
};

const TransferButton: React.FC<FieldProps & { target?: "thumbnail" }> = ({
  target,
  ...props
}) => {
  const refresh = useRefresh();
  const record = useRecordContext(props);
  const apiProvider = useDataProvider();

  if (!TransferableType.is(record?.type)) {
    return null;
  }

  return (
    <Button
      variant="contained"
      onClick={() => {
        const params: any = {};
        if (target === "thumbnail") {
          params.transferThumbnail = true;
        } else {
          params.transfer = true;
        }

        if (record) {
          void apiProvider
            .put(`media/${record.id}`, {
              ...record,
              ...params,
            })
            .then(() => {
              refresh();
            });
        }
      }}
    >
      Transfer
    </Button>
  );
};

export const ThumbnailEditField: React.FC<FieldProps> = (props) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Stack spacing={2}>
      <FormDataConsumer>
        {() => {
          return !loaded ? (
            <Stack direction="column" spacing={2}>
              <Box
                onClick={(e) => {
                  setLoaded(true);
                  e.stopPropagation();
                }}
                style={{ margin: 20 }}
              >
                <MediaField
                  {...props}
                  source="thumbnail"
                  type="image/jpg"
                  controls={false}
                />
              </Box>
              <GenerateThumbnailButton {...props} />
              <TransferButton target="thumbnail" source="thumbnail" />
            </Stack>
          ) : (
            <Box style={{ display: "flex", flexDirection: "column" }}>
              <TextInput
                {...props}
                label="thumbnail"
                source="thumbnail"
                type={"url"}
              />
              <MediaInput
                {...props}
                label="Location"
                sourceLocation="thumbnail"
                sourceType={ImageType.types[0].value}
                showInputOnClick
              />
              <Button
                onClick={() => {
                  setLoaded(false);
                }}
              >
                Preview
              </Button>
            </Box>
          );
        }}
      </FormDataConsumer>
    </Stack>
  );
};

const MediaEditToolbar: React.FC = () => {
  const record = useRecordContext();
  return (
    <React.Fragment>
      <Toolbar>
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent={"center"}
          className={ToolbarClasses.defaultToolbar}
        >
          <Box style={{ width: "50%" }}>
            <SaveButton />
          </Box>
          <Box
            style={{
              width: "50%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            {record?.deletedAt ? <DeleteWithConfirmButton /> : <DeleteButton />}
          </Box>
        </Stack>
      </Toolbar>
    </React.Fragment>
  );
};

export const MediaEdit: React.FC<EditProps> = (props: EditProps) => {
  const apiProvider = useDataProvider();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  const { record } = useEditController(props);

  if (isLoadingPermissions || !record) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);

  return (
    <EditForm
      title={<EditTitle {...props} />}
      {...props}
      transform={transformMedia(apiProvider)}
      redirect={false}
      preview={<MediaPreview />}
      actions={
        <Stack direction={"row"} spacing={2} paddingY={2}>
          <MediaTGPostButton />
        </Stack>
      }
    >
      <TabbedForm
        toolbar={<MediaEditToolbar />}
        style={{
          background: record?.deletedAt ? alpha("#ff0000", 0.3) : undefined,
        }}
      >
        <FormTab label="general">
          <Grid container spacing={2}>
            <Grid item md={6}>
              <MediaInput source="location" showInputOnClick />
              <TransferButton {...props} source="location" />
              <GenerateExtraButton source="extra" />
            </Grid>
            <Grid item md={6}>
              {isAdmin && <ReferenceUserInput source="creator" />}
              <ReferenceArrayKeywordInput source="keywords" showAdd />
              <ThumbnailEditField source="thumbnail" />
              <MediaSuggestedEntityRelations />
            </Grid>
            <Grid item md={12}>
              <TextInput source="label" fullWidth />
              <TextInput source="description" fullWidth multiline />
              <OpenAIEmbeddingJobButton
                resource={"media"}
                valueSource="description"
              />
              <Box>
                <Box>
                  <DateField
                    label="Updated At"
                    source="updatedAt"
                    showTime={true}
                  />
                </Box>
                <Box>
                  <DateField
                    label="Created At"
                    source="createdAt"
                    showTime={true}
                  />
                </Box>
                <DateField
                  label="Deleted At"
                  source="deletedAt"
                  showTime={true}
                />
              </Box>
            </Grid>
          </Grid>
        </FormTab>
        <FormTab label="events">
          <Stack spacing={2} width={"100%"}>
            <CreateEventFromMediaButton />
            <ReferenceArrayEventInput source="events" defaultValue={[]} />
            <ReferenceManyEventField
              label="Events"
              target="media[]"
              source="id"
              filter={{
                withDrafts: true,
              }}
            />
          </Stack>
        </FormTab>
        <FormTab label="areas">
          <ReferenceAreaTab source="areas" />
        </FormTab>
        <FormTab label="links">
          <ReferenceLinkTab source="links" />
        </FormTab>
        <FormTab label="social posts">
          <SocialPostFormTabContent type="media" source="id" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};
