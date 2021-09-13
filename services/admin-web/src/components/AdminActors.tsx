import { ActorPageContent } from "@econnessione/shared/components/ActorPageContent";
import { http } from "@econnessione/shared/io";
import { renderValidationErrors } from "@econnessione/shared/utils/renderValidationErrors";
import * as E from "fp-ts/lib/Either";
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
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import { AvatarField } from "./Common/AvatarField";
import MarkdownInput from "./Common/MarkdownInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";

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
    transform={({ newMemberIn, ...a }) => {
      const memberIn = a.memberIn.concat(
        newMemberIn
          ? newMemberIn.map((m: any) => ({
              ...m,
              endDate:
                m.endDate === ""
                  ? undefined
                  : new Date(m.endDate).toISOString(),
            }))
          : []
      );
      const payload = {
        ...a,
        memberIn,
      };

      return payload;
    }}
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
          <ImageField />
        </ImageInput>
      </FormTab>

      <FormTab label="Content">
        <MarkdownInput source="body" />
      </FormTab>

      <FormTab label="Groups">
        <ArrayInput source="newMemberIn">
          <SimpleFormIterator>
            <ReferenceInput source="group" reference="groups">
              <AutocompleteInput optionText="name" />
            </ReferenceInput>
            <DateInput source="startDate" />
            <DateInput source="endDate" />
          </SimpleFormIterator>
        </ArrayInput>
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
              E.fold(renderValidationErrors, (p) => (
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
  <Create {...props} title="Create an Actor">
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
