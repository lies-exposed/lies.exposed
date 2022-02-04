import { MediaType } from "@econnessione/shared/io/http/Media";
import { uuid } from "@econnessione/shared/utils/uuid";
import { Box } from "@material-ui/core";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
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
} from "react-admin";
import { MediaField } from "./Common/MediaField";
import { MediaInput } from "./Common/MediaInput";
import ReferenceArrayEventInput from "./Common/ReferenceArrayEventInput";
import RichTextInput from "./Common/RichTextInput";
import { apiProvider } from "@client/HTTPAPI";
import { uploadFile } from "@client/MediaAPI";

const RESOURCE = "media";

const ytVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/;
const bitchuteVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?bitchute\.com\/video\/([\w\-_]*)/;
const odyseeVideoRegExp =
  /http(?:s?):\/\/(?:www\.)?odysee\.com\/\$\/download\/([^/]+)\/([^/]+)$/;

export const parsePlatformURL = (url: string): E.Either<Error, string> => {
  const match = url.match(ytVideoRegExp);
  if (match !== null && typeof match[1] === "string") {
    return E.right(`https://www.youtube.com/embed/${match[1]}`);
  }

  const matchBitchute = url.match(bitchuteVideoRegExp);

  if (matchBitchute !== null && typeof matchBitchute[1] === "string") {
    return E.right(`https://www.bitchute.com/embed/${matchBitchute[1]}/`);
  }

  const odyseeMatch = url.match(odyseeVideoRegExp);
  if (
    typeof odyseeMatch?.[1] === "string" &&
    typeof odyseeMatch?.[2] === "string"
  ) {
    return E.right(
      `https://odysee.com/$/embed/${odyseeMatch[1]}/${odyseeMatch[2]}`
    );
  }

  return E.left(new Error(`Cant parse url ${url}`));
};

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
      <MediaField source="location" />
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

export const MediaEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props} transform={transformMedia}>
    <TabbedForm>
      <FormTab label="general">
        <TextInput source="location" type={"url"} />
        <MediaField source="location" />
        <MediaInput sourceLocation="location" sourceType="type" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />

        <RichTextInput source="description" />
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
              <RichTextInput
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
