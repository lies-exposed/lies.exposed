import { MapInput } from "@liexp/ui/lib/components/admin/MapInput";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm";
import ReferenceArrayEventInput from "@liexp/ui/lib/components/admin/events/ReferenceArrayEventInput";
import AreaPreview from "@liexp/ui/lib/components/admin/previews/AreaPreview";
import {
  Create,
  Datagrid,
  DateField,
  FormTab,
  FunctionField,
  List,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  required,
  useRecordContext,
  type CreateProps,
  type EditProps,
  type ListProps,
  Button,
  Loading,
} from "@liexp/ui/lib/components/admin/react-admin";
import { ReferenceMediaTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceMediaTab";
import { transformMedia } from "@liexp/ui/lib/components/admin/transform.utils";
import * as React from "react";

const RESOURCE = "areas";

export const AreaList: React.FC<ListProps> = () => (
  <List resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="label" />
      <FunctionField
        source="media"
        render={(a) => {
          return (a.media ?? []).length;
        }}
      />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = () => {
  const record = useRecordContext();
  return <span>Area {record?.title}</span>;
};

const transformArea = ({ newMedia = [], newEvents, ...area }: any): any => {
  const media = transformMedia(newMedia);
  return {
    ...area,
    media: area.media.concat(media),
  };
};

const OpenInGMapsButton: React.FC = () => {
  const record = useRecordContext();
  return record ? (
    <Button
      label="Open in GMaps"
      onClick={(): void => {
        window.open(
          `https://www.google.com/maps/@${record.geometry.coordinates[1]},${record.geometry.coordinates[0]},16.42z`,
          "_blank",
        );
      }}
    />
  ) : (
    <Loading />
  );
};
export const AreaEdit: React.FC<EditProps> = () => (
  <EditForm
    title={<EditTitle />}
    redirect={false}
    transform={transformArea}
    preview={<AreaPreview />}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="label" />
        <ReactPageInput source="body" onlyText />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Geometry">
        <MapInput source="geometry" />
        <OpenInGMapsButton />
      </FormTab>
      <FormTab label="Events">
        <ReferenceArrayEventInput source="events" />
      </FormTab>
      <FormTab label="Media">
        <ReferenceMediaTab source="media" />
      </FormTab>
    </TabbedForm>
  </EditForm>
);

export const AreaCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Post">
    <SimpleForm>
      <TextInput source="label" validate={[required()]} />
      <MapInput source="geometry" />
      <ReactPageInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
