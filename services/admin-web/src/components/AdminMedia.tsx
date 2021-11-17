import { MediaType } from "@econnessione/shared/io/http/Media";
import { uuid } from "@econnessione/shared/utils/uuid";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  SelectInput,
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
  UrlField,
  FormDataConsumer,
} from "react-admin";
import MarkdownInput from "./Common/MarkdownInput";
import { apiProvider } from "@client/HTTPAPI";
import { uploadFile } from "@client/MediaAPI";

const RESOURCE = "media";

export const MediaList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="type" />
      <ImageField source="location" />
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
        data.location.rawFile
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
        <UrlField source="location" />
        <SelectInput
          source="type"
          choices={MediaType.types.map((v) => ({ id: v.value, name: v.value }))}
        />
        <FormDataConsumer>
          {({ formData }) => {
            if (formData.type === MediaType.types[2].value) {
              return (
                <video
                  controls={true}
                  autoPlay={false}
                  src={formData.location}
                />
              );
            }
            return <ImageField source="location" />;
          }}
        </FormDataConsumer>
        <ImageInput source="location">
          <ImageField source="src" />
        </ImageInput>
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />

        <MarkdownInput source="description" />
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
