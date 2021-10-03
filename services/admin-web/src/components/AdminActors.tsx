import { http } from "@econnessione/shared/io";
import { ActorPageContent } from "@econnessione/ui/components/ActorPageContent";
import { ValidationErrorsLayout } from "@econnessione/ui/components/ValidationErrorsLayout";
import { uuid } from "@utils/uuid";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  ReferenceInput,
  DateField,
  DateInput,
  AutocompleteInput,
  Edit,
  EditProps,
  FormDataConsumer,
  FormTab,
  ImageField,
  ArrayInput,
  ImageInput,
  List,
  ListProps,
  ReferenceArrayField,
  ReferenceManyField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  SimpleFormIterator,
  Record,
  ReferenceArrayInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import { AvatarField } from "./Common/AvatarField";
import MarkdownInput from "./Common/MarkdownInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";
import { dataProvider } from "@client/HTTPAPI";
import { uploadImages } from "@client/MediaAPI";

export const ActorList: React.FC<ListProps> = (props) => (
  <List {...props} resource="actors" perPage={50}>
    <Datagrid rowClick="edit">
      <TextField label="Full Name" source="fullName" />
      <TextField label="username" source="username" />
      <AvatarField source="avatar" />
      <DateField label="Updated At" source="updatedAt" showTime={true} />
    </Datagrid>
  </List>
);

const transformActor = async (id: string, data: Record): Promise<Record> => {
  const imagesTask = pipe(
    uploadImages(dataProvider)(
      "actors",
      id,
      data.avatar.rawFile ? [data.avatar.rawFile] : []
    )
  );

  // eslint-disable-next-line @typescript-eslint/return-await
  return pipe(
    imagesTask,
    TE.map(([avatar]) => ({
      ...data,
      id,
      avatar,
    }))
  )().then((result) => {
    if (result._tag === "Left") {
      return Promise.reject(result.left);
    }
    return result.right;
  });
};

const EditTitle: React.FC = ({ record }: any) => {
  return <span>Actor {record.fullName}</span>;
};

export const ActorEdit: React.FC<EditProps> = (props) => (
  <Edit
    title={<EditTitle {...props} />}
    {...props}
    actions={
      <>
        <WebPreviewButton resource="actors" record={{ id: props.id } as any} />
      </>
    }
    transform={(a) => transformActor(a.id as any, a)}
  >
    <TabbedForm>
      <FormTab label="generals">
        <ImageField source="avatar" />
        <ColorInput source="color" />
        <TextInput source="username" />
        <TextInput source="fullName" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
      </FormTab>
      <FormTab label="Avatar">
        <ImageInput source="avatar">
          <ImageField source="src" />
        </ImageInput>
      </FormTab>

      <FormTab label="Content">
        <MarkdownInput source="body" />
      </FormTab>

      <FormTab label="Groups">
        <ReferenceArrayInput source="memberIn" reference="groups-members">
          <SimpleFormIterator>
            <ReferenceInput source="group" reference="groups">
              <AutocompleteInput optionText="name" />
            </ReferenceInput>
            <DateInput source="startDate" />
            <DateInput source="endDate" />
          </SimpleFormIterator>
        </ReferenceArrayInput>

        <ReferenceArrayField source="memberIn" reference="groups-members">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="group.name" />
            <DateField source="startDate" />
            <DateField source="endDate" />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Events">
        <ReferenceManyField label="Events" target="actors[]" reference="events">
          <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            <DateField source="createdAt" />
          </Datagrid>
        </ReferenceManyField>
      </FormTab>
      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return pipe(
              http.Actor.Actor.decode(formData),
              E.fold(ValidationErrorsLayout, (p) => (
                <ActorPageContent actor={p} groups={[]} />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const ActorCreate: React.FC<CreateProps> = (props) => (
  <Create
    {...props}
    title="Create an Actor"
    transform={(a) => transformActor(uuid(), a)}
  >
    <SimpleForm>
      <ColorInput source="color" />
      <TextInput source="username" />
      <TextInput source="fullName" />
      <ImageInput source="avatar">
        <ImageField />
      </ImageInput>
      <MarkdownInput source="body" />
    </SimpleForm>
  </Create>
);
