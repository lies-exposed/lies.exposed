import { PageContent } from "@econnessione/shared/components/PageContent";
import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  FormDataConsumer,
  FormTab,
  List,
  ListProps,
  required,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import MarkdownInput from "./Common/MarkdownInput";

export const PageList: React.FC<ListProps> = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField label="Title" source="title" />
      <TextField label="Path" source="path" />
      <DateField label="Updated At" source="updatedAt" showTime={true} />
      <DateField label="Created At" source="createdAt" showTime={true} />
    </Datagrid>
  </List>
);

const EditTitle: React.FC = ({ record }: any) => {
  return <span>Page {record.title}</span>;
};

export const PageEdit: React.FC<EditProps> = (props) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="title" />
        <TextInput source="path" />
        <MarkdownInput source="body" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
      </FormTab>
      <FormTab label="preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return <PageContent body={formData.body} />;
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const PageCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create Page" {...props}>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <TextInput source="path" validate={[required()]} />
      <MarkdownInput source="body" validate={[required()]} />
    </SimpleForm>
  </Create>
);
