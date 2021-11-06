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
  ImageInput,
  List,
  ListProps,
  Record,
  ReferenceManyField,
  required,
  SimpleForm,
  TabbedForm,
  TextField,
} from "react-admin";
import MarkdownInput from "./Common/MarkdownInput";
import { apiProvider } from "@client/HTTPAPI";
import { uploadFile } from "@client/MediaAPI";

const RESOURCE = "images";

export const ImagesList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <ImageField source="location" />
      <TextField source="description" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const transformImage = (data: Record): Record | Promise<Record> => {
  if (data.location.rawFile) {
    return pipe(
      uploadFile(apiProvider)(
        "images",
        data.id.toString(),
        data.location.rawFile
      ),
      TE.map((location) => ({
        ...data,
        id: data.id.toString(),
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
  return <span>Image {record?.description}</span>;
};

export const ImageEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props} transform={transformImage}>
    <TabbedForm>
      <FormTab label="general">
        <ImageField source="location" />
        <ImageInput source="location">
          <ImageField source="src" />
        </ImageInput>
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />

        <MarkdownInput source="description" />
      </FormTab>
      <FormTab label="events">
        <ReferenceManyField label="Events" target="images[]" reference="events">
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

export const ImageCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Image"
    {...props}
    transform={(r) => transformImage({ ...r, id: uuid() })}
  >
    <SimpleForm>
      <ImageInput source="location" validate={[required()]}>
        <ImageField source="src" />
      </ImageInput>
      <MarkdownInput
        source="description"
        defaultValue=""
        validate={[required()]}
      />
    </SimpleForm>
  </Create>
);
