import { type http } from "@liexp/shared/lib/io/index.js";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import PagePreview from "@liexp/ui/lib/components/admin/previews/PagePreview.js";
import {
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  type EditProps,
  FormTab,
  List,
  type ListProps,
  required,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

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
    <EditForm
      preview={<PagePreview />}
      title={<EditTitle record={record} />}
      {...props}
      redirect={false}
    >
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
      <TextInput source="body" multiline />
      <ReactPageInput source="excerpt" validate={[required()]} onlyText />
      <ReactPageInput source="body2" validate={[required()]} />
    </SimpleForm>
  </Create>
);
