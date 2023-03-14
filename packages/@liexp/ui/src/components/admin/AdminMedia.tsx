import { parseURL } from "@liexp/shared/helpers/media";
import { ImageType } from "@liexp/shared/io/http/Media";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { checkIsAdmin } from "@liexp/shared/utils/user.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as React from "react";
import {
  BooleanInput,
  Create,
  type CreateProps,
  Datagrid,
  type DataProvider,
  DateField,
  DeleteButton,
  DeleteWithConfirmButton,
  type EditProps,
  type FieldProps,
  FormTab,
  FunctionField,
  List,
  type ListProps,
  LoadingPage,
  type RaRecord,
  ReferenceField,
  ReferenceManyField,
  required,
  SaveButton,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useGetIdentity,
  usePermissions,
  useRecordContext,
  useRefresh,
} from "react-admin";
import { uploadFile } from "../../client/admin/MediaAPI";
import { Box, Button, Grid, Typography } from "../mui";
import { EditForm } from "./common/EditForm";
import { CreateEventFromMediaButton } from "./events/CreateEventFromMediaButton";
import ReferenceArrayEventInput from "./events/ReferenceArrayEventInput";
import ReferenceArrayKeywordInput from "./keywords/ReferenceArrayKeywordInput";
import { MediaField } from "./media/MediaField";
import { MediaInput } from "./media/MediaInput";
import { MediaTypeInput } from "./media/MediaTypeInput";
import MediaPreview from "./previews/MediaPreview";
import { ReferenceLinkTab } from "./tabs/ReferenceLinkTab";
import ReferenceUserInput from "./user/ReferenceUserInput";

const RESOURCE = "media";

const mediaFilters = [
  <TextInput key="description" source="description" alwaysOn size="small" />,
  <BooleanInput key="emptyEvents" source="emptyEvents" alwaysOn size="small" />,
  <MediaTypeInput key="type" source="type" alwaysOn size="small" />,
  <BooleanInput key="deletedOnly" source="deletedOnly" alwaysOn size="small" />,
];

export const MediaList: React.FC<ListProps> = (props) => {
  const { identity, isLoading } = useGetIdentity();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoading || isLoadingPermissions) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions || []);

  const filter = !isAdmin && identity?.id ? { creator: identity?.id } : {};

  return (
    <List
      {...props}
      resource={RESOURCE}
      filters={mediaFilters}
      filter={filter}
      filterDefaultValues={{
        _sort: "createdAt",
        _order: "DESC",
        emptyValues: false,
      }}
      perPage={20}
    >
      <Datagrid rowClick="edit">
        <MediaField type="image/jpeg" source="thumbnail" />
        <FunctionField
          label="events"
          render={(r: any) => {
            const url = r.location
              ? new URL(r.location)
              : {
                  hostname: "no link given",
                };

            return (
              <Box>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: 14,
                  }}
                >
                  {url.hostname}
                </Typography>
                <Typography variant="subtitle1">{r.type}</Typography>
                <Typography variant="body1">{r.description}</Typography>
              </Box>
            );
          }}
        />
        {isAdmin && (
          <ReferenceField source="creator" reference="users">
            <FunctionField
              label="creator"
              render={(r: any) => (r ? `${r.firstName} ${r.lastName}` : "")}
            />
          </ReferenceField>
        )}

        <FunctionField
          label="events"
          render={(r: any) => {
            return r.events.length;
          }}
        />
        <FunctionField
          label="links"
          render={(r: any) => {
            return r.links.length;
          }}
        />

        <DateField source="updatedAt" />
        <DateField source="createdAt" />
      </Datagrid>
    </List>
  );
};

const transformMedia =
  (apiProvider: DataProvider<string>) =>
  (data: RaRecord): RaRecord | Promise<RaRecord> => {
    const mediaTask =
      data._type === "fromFile" && data.location.rawFile
        ? uploadFile(apiProvider)(
            "media",
            data.id.toString(),
            data.location.rawFile,
            data.location.rawFile.type
          )
        : data._type === "fromURL" && data.url
        ? TE.fromEither(parseURL(data.url))
        : TE.right({ type: data.type, location: data.location });

    const events = (data.events ?? []).concat(data.newEvents ?? []);
    const links = (data.links ?? []).concat(
      (data.newLinks ?? []).flatMap((l: any) => l.ids)
    );
    const keywords = (data.keywords ?? []).concat(data.newKeywords ?? []);

    return pipe(
      mediaTask,
      TE.map((media) => ({
        ...data,
        id: data.id.toString(),
        ...media,
        events,
        links,
        keywords,
      })),
      throwTE
    );
  };

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
          >
            <MediaField {...props} source="thumbnail" type="image/jpg" />
          </Box>
          <GenerateThumbnailButton {...props} />
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

export const MediaEditField: React.FC<FieldProps> = (props) => {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Box>
      {!loaded ? (
        <Box
          style={{ display: "flex", flexDirection: "column" }}
          onClick={() => {
            setLoaded(true);
          }}
        >
          <MediaField {...props} source="location" label="Location" />
        </Box>
      ) : (
        <Box style={{ display: "flex", flexDirection: "column" }}>
          <TextInput
            {...props}
            label="Location"
            source="location"
            type={"url"}
          />
          <MediaInput
            {...props}
            label="Location"
            sourceLocation="location"
            sourceType="type"
          />
          <MediaTypeInput source="type" />
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
    >
      <TabbedForm toolbar={<MediaEditToolbar />}>
        <FormTab label="general">
          <Grid container>
            <Grid item md={6}>
              <MediaField source="location" />
              <MediaInput sourceLocation="location" sourceType="type" />
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

export const MediaCreate: React.FC<CreateProps> = (props) => {
  const apiProvider = useDataProvider();

  return (
    <Create
      title="Create a Media"
      {...props}
      transform={(r: any) => transformMedia(apiProvider)({ ...r, id: uuid() })}
    >
      <SimpleForm>
        <MediaInput sourceLocation="location" sourceType="type" />
        <TextInput
          source="description"
          multiline
          fullWidth
          validate={[required()]}
        />
      </SimpleForm>
    </Create>
  );
};
