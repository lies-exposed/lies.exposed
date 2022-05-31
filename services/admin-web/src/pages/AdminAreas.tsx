import { http } from "@liexp/shared/io";
import { AreaPageContent } from "@liexp/ui/components/AreaPageContent";
import { ValidationErrorsLayout } from "@liexp/ui/components/ValidationErrorsLayout";
import { MapInput } from "@liexp/ui/components/admin/MapInput";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
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
  useRecordContext,
} from "react-admin";
import ReferenceArrayEventInput from "../components/Common/ReferenceArrayEventInput";
import { ReferenceMediaTab } from "components/tabs/ReferenceMediaTab";

const RESOURCE = "areas";

export const AreaList: React.FC<ListProps> = () => (
  <List resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="label" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = () => {
  const record = useRecordContext();
  return <span>Area {record?.title}</span>;
};

export const AreaEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle />}>
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
        <ReactPageInput source="body" />
      </FormTab>
      <FormTab label="Events">
        <ReferenceArrayEventInput source="events" />
      </FormTab>
      <FormTab label="Media">
        <ReferenceMediaTab source="media" />
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
