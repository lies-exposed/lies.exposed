import { type http } from "@liexp/shared/lib/io/index.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { MapInput } from "@liexp/ui/lib/components/admin/MapInput.js";
import { AreaTGPostButton } from "@liexp/ui/lib/components/admin/areas/button/AreaTGPostButton.js";
import { UpdateAreaGeometryByLabelButton } from "@liexp/ui/lib/components/admin/areas/button/UpdateAreaGeometryByLabelButton.js";
import { UpdateAreaGeometryWithCoordinatesButton } from "@liexp/ui/lib/components/admin/areas/button/UpdateAreaGeometryWithCoordinatesButton.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import ReferenceArrayEventInput from "@liexp/ui/lib/components/admin/events/ReferenceArrayEventInput.js";
import ReferenceMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInput.js";
import AreaPreview from "@liexp/ui/lib/components/admin/previews/AreaPreview.js";
import {
  BooleanInput,
  Button,
  DateField,
  FormTab,
  Loading,
  TabbedForm,
  useRecordContext,
  useRefresh,
  type EditProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { ReferenceMediaTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceMediaTab.js";
import { transformMedia } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { Stack } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Area {record?.title}</span>;
};

const transformArea = ({
  newMediaRef = [],
  newEvents: _newEvents,
  ...area
}: any): http.Area.Area => {
  const media = transformMedia(newMediaRef);
  return {
    ...area,
    body: area.body,
    featuredImage: area.featuredImage?.id,
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

const AreaEdit: React.FC<EditProps> = () => (
  <EditForm
    title={<EditTitle />}
    redirect={false}
    transform={transformArea}
    preview={<AreaPreview />}
    actions={<AreaTGPostButton />}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <TextWithSlugInput source="label" slugSource="slug" />
        <BooleanInput source="draft" />
        <ReferenceMediaInput source="featuredImage.id" />
        <BlockNoteInput source="body" onlyText />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Geometry">
        <MapInput source="geometry" />
        <Stack spacing={2} alignItems={"flex-start"}>
          <UpdateAreaGeometryByLabelButton />
          <UpdateAreaGeometryWithCoordinatesButton />
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

export default AreaEdit;
