import { parsePlatformURL } from "@liexp/shared/helpers/media";
import { MediaType } from "@liexp/shared/io/http/Media";
import { uuid } from "@liexp/shared/utils/uuid";
import { Box, Button } from "@material-ui/core";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import refresh from "ra-core/esm/sideEffect/refresh";
import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  Filter,
  FormDataConsumer,
  FormTab,
  List,
  ListProps,
  Record,
  ReferenceManyField,
  required,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  ImageField,
  FieldProps,
} from "react-admin";
import { MediaField } from "./Common/MediaField";
import { MediaInput } from "./Common/MediaInput";
import ReferenceArrayEventInput from "./Common/ReferenceArrayEventInput";
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

const MediaFilters: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput source="description" alwaysOn size="small" />
    </Filter>
  );
};

export const MediaList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filters={<MediaFilters />}
    filterDefaultValues={{
      _sort: "createdAt",
      _order: "DESC",
    }}
    perPage={20}
  >
    <Datagrid rowClick="edit">
      <TextField source="type" />
      <ImageField source="thumbnail" />
      <TextField source="description" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const transformMedia = (data: Record): Record | Promise<Record> => {
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
  return pipe(
    mediaTask,
    TE.map((media) => ({
      ...data,
      id: data.id.toString(),
      ...media,
      events,
    }))
  )().then((result) => {
    if (E.isLeft(result)) {
      throw result.left;
    }
    return result.right;
  });
};

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Media {record?.description}</span>;
};

const GenerateThumbnailButton: React.FC<FieldProps> = (props) => {
  return (
    <Button
      onClick={() => {
        void apiProvider
          .put(`media/${props.record.id}`, {
            ...props.record,
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
        <Box onClick={() => {
          setLoaded(true)
        }}>
          <TextInput {...props} source="thumbnail" type={"url"} />
          <ImageField {...props} source="thumbnail" />
        </Box>
      ) : (
        <Box>
          <MediaField {...props} source="location" />
          <MediaInput {...props} sourceLocation="location" sourceType="type" />
        </Box>
      )}

      <GenerateThumbnailButton {...props} />
    </Box>
  );
};

export const MediaEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props} transform={transformMedia}>
    <TabbedForm>
      <FormTab label="general">
        <ThumbnailField />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
        <TextInput source="description" />
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
