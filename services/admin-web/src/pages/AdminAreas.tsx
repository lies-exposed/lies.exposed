import { Area } from "@liexp/shared/lib/io/http/Area.js";
import { MapInput } from "@liexp/ui/lib/components/admin/MapInput.js";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput.js";
import { AreaTGPostButton } from "@liexp/ui/lib/components/admin/areas/button/AreaTGPostButton.js";
import { SearchAreaCoordinatesButton } from "@liexp/ui/lib/components/admin/areas/button/SearchAreaCoordinatesButton.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import ReferenceArrayEventInput from "@liexp/ui/lib/components/admin/events/ReferenceArrayEventInput.js";
import AreaPreview from "@liexp/ui/lib/components/admin/previews/AreaPreview.js";
import {
  BooleanField,
  BooleanInput,
  Button,
  Create,
  Datagrid,
  DateField,
  FilterLiveSearch,
  FormTab,
  FunctionField,
  List,
  Loading,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  required,
  useRecordContext,
  useRefresh,
  type CreateProps,
  type EditProps,
  type ListProps
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { ReferenceMediaTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceMediaTab.js";
import { transformMedia } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { Box, Stack } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const RESOURCE = "areas";

const areaFilters = [
  <FilterLiveSearch key="q" source="q" alwaysOn />,
  <BooleanInput
    key="draft"
    label="Draft"
    source="draft"
    defaultValue={false}
    alwaysOn
    size="small"
  />,
  <BooleanInput key="withDeleted" source="withDeleted" alwaysOn size="small" />,
];

export const AreaList: React.FC<ListProps> = () => (
  <List resource={RESOURCE} filters={areaFilters}>
    <Datagrid
      rowClick="edit"
      rowSx={(r) => ({
        opacity: r.draft ? 0.7 : 1,
      })}
      results={50}
    >
      <FunctionField
        render={() => {
          return (
            <Box>
              <TextField display={"block"} source="label" />
              <TextField source="slug" />
            </Box>
          );
        }}
      />

      <BooleanField source="draft" />
      <FunctionField
        source="media"
        render={(a: Area) => {
          return (a.media ?? []).length;
        }}
      />
      <FunctionField
        source="socialPosts"
        render={(a: Area) => {
          return (a.socialPosts ?? []).length;
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

const transformArea = ({ newMediaRef = [], newEvents, ...area }: any): any => {
  const media = transformMedia(newMediaRef);
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

const UpdateGeometryButton: React.FC = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  return record ? (
    <Button
      label="Update Geometry (Point)"
      onClick={(): void => {
        void dataProvider
          .update("areas", {
            id: record.id,
            data: { ...record, events: [], updateGeometry: true },
            previousData: record,
          })
          .then(() => {
            refresh();
          });
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
    actions={<AreaTGPostButton />}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="label" />
        <TextInput source="slug" />
        <BooleanInput source="draft" />
        <ReactPageInput source="body" onlyText />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Geometry">
        <MapInput source="geometry" />
        <Stack spacing={2} alignItems={"flex-start"}>
          <SearchAreaCoordinatesButton />
          <UpdateGeometryButton />
          <OpenInGMapsButton />
        </Stack>
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
      <TextInput source="slug" validate={[required()]} />
      <MapInput source="geometry" />
      <ReactPageInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
