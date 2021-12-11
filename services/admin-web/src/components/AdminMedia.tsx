import { uuid } from "@econnessione/shared/utils/uuid";
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
  FormTab,
  ImageField,
  List,
  ListProps,
  Record,
  ReferenceManyField,
  required,
  SimpleForm,
  TabbedForm,
  TextField,
  UrlField,
  TextInput,
  Filter,
} from "react-admin";
import { MediaField } from "./Common/MediaField";
import { MediaInput } from "./Common/MediaInput";
import RichTextInput from "./Common/RichTextInput";
import { apiProvider } from "@client/HTTPAPI";
import { uploadFile } from "@client/MediaAPI";

const RESOURCE = "media";

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
  if (data.location.rawFile) {
    return pipe(
      uploadFile(apiProvider)(
        "media",
        data.id.toString(),
        data.location.rawFile,
        data.type
      ),
      TE.map(({ type, location }) => ({
        ...data,
        id: data.id.toString(),
        type,
        location,
      }))
    )().then((result) => {
      if (E.isLeft(result)) {
        throw result.left;
      }
      return result.right;
    });
  }
  return data;
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
      <MediaInput sourceType="type" sourceLocation="location" />
      <RichTextInput
        source="description"
        defaultValue=""
        validate={[required()]}
      />
    </SimpleForm>
  </Create>
);
