import { ImageType } from "@liexp/shared/lib/io/http/Media";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils";
import * as React from "react";
import {
  Datagrid,
  DateField,
  DeleteButton,
  DeleteWithConfirmButton,
  FormTab,
  LoadingPage,
  ReferenceManyField,
  SaveButton,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  usePermissions,
  useRecordContext,
  useRefresh,
  type EditProps,
  type FieldProps,
} from "react-admin";
import { transformMedia } from "../../../client/admin/MediaAPI";
import { Box, Button, Grid } from "../../mui";
import { EditForm } from "../common/EditForm";
import { MediaTGPostButton } from "../common/SocialPostButton";
import { CreateEventFromMediaButton } from "../events/CreateEventFromMediaButton";
import ReferenceArrayEventInput from "../events/ReferenceArrayEventInput";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput";
import MediaPreview from "../previews/MediaPreview";
import { ReferenceLinkTab } from "../tabs/ReferenceLinkTab";
import ReferenceUserInput from "../user/ReferenceUserInput";
import { MediaField } from "./MediaField";
import { MediaInput } from "./input/MediaInput";

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Media {record?.description}</span>;
};

const GenerateThumbnailButton: React.FC<FieldProps> = (props) => {
  const refresh = useRefresh();
  const record = useRecordContext(props);
  const apiProvider = useDataProvider();
  return (
    <Button
      onClick={() => {
        void apiProvider
          .put(`media/${record.id}`, {
            ...record,
            overrideThumbnail: true,
          })
          .then(() => {
            refresh();
          });
      }}
    >
      Generate Thumbnail
    </Button>
  );
};

const TransferButton: React.FC<FieldProps & { target?: "thumbnail" }> = ({
  target,
  ...props
}) => {
  const refresh = useRefresh();
  const record = useRecordContext(props);
  const apiProvider = useDataProvider();
  return (
    <Button
      onClick={() => {
        const params: any = {};
        if (target === "thumbnail") {
          params.transferThumbnail = true;
        } else {
          params.transfer = true;
        }
        void apiProvider
          .put(`media/${record.id}`, {
            ...record,
            ...params,
          })
          .then(() => {
            refresh();
          });
      }}
    >
      Transfer
    </Button>
  );
};

export const ThumbnailEditField: React.FC<FieldProps> = (props) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Box style={{ display: "flex" }}>
      {!loaded ? (
        <Box style={{ display: "flex", flexDirection: "column" }}>
          <Box
            onClick={() => {
              setLoaded(true);
            }}
            style={{ margin: 20 }}
          >
            <MediaField {...props} source="thumbnail" type="image/jpg" />
          </Box>
          <GenerateThumbnailButton {...props} />
          <TransferButton target="thumbnail" />
        </Box>
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
          />
          <Button
            onClick={() => {
              setLoaded(false);
            }}
          >
            Preview
          </Button>
        </Box>
      )}
    </Box>
  );
};

const MediaEditToolbar: React.FC = () => {
  const record = useRecordContext();
  return (
    <React.Fragment>
      <Box style={{ display: "flex", margin: "20px" }}>
        <Grid container spacing={2} style={{ maxWidth: "100%" }}>
          <Grid flexGrow={1} item md={6}>
            <SaveButton />
          </Grid>
          <Grid
            item
            md={6}
            style={{
              display: "flex",
              alignItems: "flex-center",
              justifyContent: "flex-end",
            }}
          >
            {record.deletedAt ? <DeleteWithConfirmButton /> : <DeleteButton />}
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
};

export const MediaEdit: React.FC<EditProps> = (props: EditProps) => {
  const apiProvider = useDataProvider();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoadingPermissions) {
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
        <Box>
          <MediaTGPostButton />
        </Box>
      }
    >
      <TabbedForm toolbar={<MediaEditToolbar />}>
        <FormTab label="general">
          <Grid container>
            <Grid item md={6}>
              <MediaField source="location" />
              <MediaInput sourceLocation="location" sourceType="type" />
              <TransferButton {...props} />
            </Grid>
            <Grid item md={6}>
              {isAdmin && <ReferenceUserInput source="creator" />}
              <ReferenceArrayKeywordInput source="keywords" showAdd />
              <ThumbnailEditField />
            </Grid>
            <Grid item md={12}>
              <TextInput source="description" fullWidth multiline />
              <Box>
                <Box>
                  <DateField source="updatedAt" showTime={true} />
                </Box>
                <DateField source="createdAt" showTime={true} />
              </Box>
            </Grid>
          </Grid>
        </FormTab>
        <FormTab label="events">
          <CreateEventFromMediaButton />
          <ReferenceArrayEventInput source="events" defaultValue={[]} />
          <ReferenceManyField
            label="Events"
            target="media[]"
            reference="events"
          >
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <TextField source="title" />
              <DateField source="createdAt" />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>
        <FormTab label="links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};
