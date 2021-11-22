import { http } from "@econnessione/shared/io";
import { AreaPageContent } from "@econnessione/ui/components/AreaPageContent";
import { ValidationErrorsLayout } from "@econnessione/ui/components/ValidationErrorsLayout";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import GeometryType from "ol/geom/GeometryType";
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
import { MapInput } from "./Common/MapInput";
import ReactPageInput from "./Common/ReactPageInput";
import RichTextInput from "./Common/RichTextInput";

const RESOURCE = "areas";

export const AreaList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="label" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Area {record.title}</span>;
};

export const AreaEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="label" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Geometry">
        <MapInput source="geometry" type={GeometryType.POLYGON} />
      </FormTab>
      <FormTab label="Body">
        <RichTextInput source="body" />
      </FormTab>
      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return pipe(
              http.Area.Area.decode(formData),
              E.fold(ValidationErrorsLayout, (p) => (
                <AreaPageContent
                  {...p}
                  onGroupClick={() => undefined}
                  onTopicClick={() => undefined}
                />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const AreaCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Post" {...props}>
    <SimpleForm>
      <TextInput source="label" validate={[required()]} />
      <MapInput
        source="geometry"
        type={GeometryType.POLYGON}
        validate={[required()]}
      />
      <ReactPageInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
