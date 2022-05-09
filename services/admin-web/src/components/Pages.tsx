import { http } from "@liexp/shared/io";
import { PageContent } from "@liexp/ui/components/PageContent";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
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
  useRecordContext
} from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import RichTextInput from "./Common/RichTextInput";

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
    <Edit title={<EditTitle record={record} />} {...props}>
      <TabbedForm>
        <FormTab label="Generals">
          <TextInput source="title" />
          <TextInput source="path" />
          <RichTextInput source="excerpt" />
          <RichTextInput source="body" />
          <ReactPageInput source="body2" />
          <DateField source="createdAt" />
          <DateField source="updatedAt" />
        </FormTab>
        <FormTab label="preview">
          <FormDataConsumer>
            {({ formData, ...rest }) => {
              const qc = new QueryClient();
              return (
                <HelmetProvider>
                  <QueryClientProvider client={qc}>
                    <PageContent {...formData} />
                  </QueryClientProvider>
                </HelmetProvider>
              );
            }}
          </FormDataConsumer>
        </FormTab>
      </TabbedForm>
    </Edit>
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
