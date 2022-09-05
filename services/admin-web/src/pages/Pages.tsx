import { http } from "@liexp/shared/io";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  DateField, EditProps, FormTab,
  List,
  ListProps,
  required,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext
} from "react-admin";
import RichTextInput from "../components/Common/RichTextInput";
import { EditForm } from 'components/Common/EditForm';
import PagePreview from 'components/previews/PagePreview';

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

const EditTitle: React.FC<{ record?: http.Page.Page }> = ({ record }) => {
  return <span>Page {record?.title}</span>;
};

export const PageEdit: React.FC<EditProps> = (props) => {
  const record = useRecordContext<http.Page.Page>();
  return (
    <EditForm preview={<PagePreview />} title={<EditTitle record={record} />} {...props} redirect={false}>
      <TabbedForm>
        <FormTab label="Generals">
          <TextInput source="title" />
          <TextInput source="path" />
          <ReactPageInput source="excerpt" onlyText />
          <ReactPageInput source="body2" />
          <DateField source="createdAt" />
          <DateField source="updatedAt" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const PageCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create Page" {...props}>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <TextInput source="path" validate={[required()]} />
      <RichTextInput source="excerpt" validate={[required()]} />
      <ReactPageInput source="body" validate={[required()]} />
      <ReactPageInput source="body2" validate={[required()]} />
    </SimpleForm>
  </Create>
);
