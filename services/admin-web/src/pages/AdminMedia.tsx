import { parsePlatformURL } from "@liexp/shared/helpers/media";
import { MediaType } from "@liexp/shared/io/http/Media";
import { throwTE } from '@liexp/shared/utils/task.utils';
import { uuid } from "@liexp/shared/utils/uuid";
import { Box, Button, Typography } from "@liexp/ui/components/mui";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";

import * as React from "react";
import {
  useRecordContext,
  useRefresh,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  FieldProps,
  FormDataConsumer,
  FormTab,
  FunctionField,
  List,
  ListProps,
  RaRecord,
  ReferenceManyField,
  required,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { MediaField } from "../components/Common/MediaField";
import { MediaInput } from "../components/Common/MediaInput";
import ReferenceArrayEventInput from "../components/Common/ReferenceArrayEventInput";
import { ReferenceLinkTab } from "../components/tabs/ReferenceLinkTab";
import { apiProvider } from "@client/HTTPAPI";
import { uploadFile } from "@client/MediaAPI";

const RESOURCE = "media";

const parseURL = (
  url: string
): E.Either<Error, { type: MediaType; location: string }> => {
  if (url.includes(".jpg") ?? url.includes(".jpeg")) {
    return E.right({
      type: MediaType.types[1].value,
      location: url,
    });
  }

  if (url.includes(".png")) {
    return E.right({
      type: MediaType.types[2].value,
      location: url,
    });
  }

  if (url.includes(".pdf")) {
    return E.right({
      type: MediaType.types[4].value,
      location: url,
    });
  }

  const iframeVideosMatch = [
    "youtube.com",
    "youtu.be",
    "bitchute.com",
    "odysee.com",
    "rumble.com",
    // peertube video pattern
    "/videos/watch",
  ].some((v) => url.includes(v));

  if (iframeVideosMatch) {
    return pipe(
      parsePlatformURL(url),
      E.map((location) => ({
        type: MediaType.types[5].value,
        location,
      }))
    );
  }

  return E.left(new Error(`No matching media for given url: ${url}`));
};

const mediaFilters = [
  <TextInput key="description" source="description" alwaysOn size="small" />,
  <BooleanInput key="emptyEvents" source="emptyEvents" alwaysOn size="small" />,
];

export const MediaList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filters={mediaFilters}
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
        render={(r) => {
          const url = r.location ? new URL(r.location) : {
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
      <FunctionField
        label="events"
        render={(r) => {
          return r.events.length;
        }}
      />
      <FunctionField
        label="links"
        render={(r) => {
          return r.links.length;
        }}
      />

      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const transformMedia = (data: RaRecord): RaRecord | Promise<RaRecord> => {
  const mediaTask =
    data._type === "fromFile" && data.location.rawFile
      ? uploadFile(apiProvider)(
          "media",
          data.id.toString(),
          data.location.rawFile,
          data.type
        )
      : data._type === "fromURL" && data.url
      ? TE.fromEither(parseURL(data.url))
      : TE.right({ type: data.type, location: data.location });

  const events = (data.events ?? []).concat(data.newEvents ?? []);
  const links = (data.links ?? []).concat(
    (data.newLinks ?? []).flatMap((l: any) => l.ids)
  );

  return pipe(
    mediaTask,
    TE.map((media) => ({
      ...data,
      id: data.id.toString(),
      ...media,
      events,
      links,
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

export const ThumbnailField: React.FC<FieldProps> = (props) => {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <Box>
      {!loaded ? (
        <Box>
          <TextInput
            {...props}
            label="thumbnail"
            source="thumbnail"
            type={"url"}
          />
          <Box
            onClick={() => {
              setLoaded(true);
            }}
          >
            <GenerateThumbnailButton {...props} />
            <MediaField {...props} source="thumbnail" />
          </Box>
        </Box>
      ) : (
        <Box>
          <MediaField {...props} source="location" />
          <MediaInput
            {...props}
            label="Location"
            sourceLocation="location"
            sourceType="type"
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

export const MediaEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<EditTitle {...props} />}
    {...props}
    transform={transformMedia}
    redirect={false}
  >
    <TabbedForm>
      <FormTab label="general">
        <ThumbnailField />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
        <TextInput source="description" fullWidth multiline />
      </FormTab>
      <FormTab label="events">
        <ReferenceArrayEventInput source="events" defaultValue={[]} />
        <ReferenceManyField label="Events" target="media[]" reference="events">
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
  </Edit>
);

export const MediaCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Media"
    {...props}
    transform={(r) => transformMedia({ ...r, id: uuid() })}
  >
    <SimpleForm>
      <SelectInput
        source="_type"
        defaultValue={"fromURL"}
        choices={[
          { name: "fromURL", id: "fromURL" },
          {
            name: "fromFile",
            id: "fromFile",
          },
        ]}
      />
      <FormDataConsumer>
        {({ formData }) => {
          if (formData._type === "fromURL") {
            return (
              <Box>
                <TextInput source="url" />
                <TextInput source="description" />
              </Box>
            );
          }
          return (
            <Box>
              <MediaInput sourceType="type" sourceLocation="location" />
              <TextInput
                source="description"
                defaultValue=""
                validate={[required()]}
              />
            </Box>
          );
        }}
      </FormDataConsumer>
    </SimpleForm>
  </Create>
);
