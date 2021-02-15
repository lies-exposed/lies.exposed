import GeometryType from "ol/geom/GeometryType";
import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  DateField,

  Edit,
  EditProps,
  FormTab,


  List,
  ListProps,
  required,
  SimpleForm,

  TabbedForm,
  TextField,
  TextInput
} from "react-admin";
import { ColorField, ColorInput } from "react-admin-color-input";
import { MapInput } from "./Common/MapInput";
import MarkdownInput from "./Common/MarkdownInput";

const RESOURCE = "areas";

export const AreaList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="label" />
      <ColorField source="color" />
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
        <ColorInput source="color" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Geometry">
        <MapInput source="geometry" type={GeometryType.POLYGON} />
      </FormTab>
      <FormTab label="Body">
        <MarkdownInput source="body" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const AreaCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Post" {...props}>
    <SimpleForm>
      <TextInput source="label" validate={[required()]} />
      <ColorInput source="color" validate={[required()]} />
      <MapInput
        source="geometry"
        type={GeometryType.POLYGON}
        validate={[required()]}
      />
      <MarkdownInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
