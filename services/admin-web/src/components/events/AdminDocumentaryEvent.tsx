import * as Events from "@liexp/shared/io/http/Events";
import { DOCUMENTARY } from "@liexp/shared/io/http/Events/Documentary";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import {
  MapInput,
  MapInputType,
} from "@liexp/ui/src/components/admin/MapInput";
import * as React from "react";
import {
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FormTab,
  List,
  ListProps,
  ReferenceField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import ExcerptField from "../Common/ExcerptField";
import { MediaField } from "../Common/MediaField";
import ReferenceActorInput from "../Common/ReferenceActorInput";
import ReferenceArrayActorInput from "../Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../Common/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import ReferenceArrayMediaInput from "../Common/ReferenceArrayMediaInput";
import ReferenceMediaInput from "../Common/ReferenceMediaInput";
import { WebPreviewButton } from "../Common/WebPreviewButton";
import { transformEvent } from "./utils";

const DocumentaryEventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput source="type" value={DOCUMENTARY.value} />
      <ReferenceActorInput source="victim" alwaysOn />
      <DateInput source="date" />
    </Filter>
  );
};

export const DocumentaryList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={<DocumentaryEventsFilter />}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
    }}
  >
    <Datagrid rowClick="edit">
      <TextField source="payload.title" />
      <ReferenceField reference="media" source="payload.media">
        <MediaField source="location" />
      </ReferenceField>

      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const DocumentaryReleaseTitle: React.FC<{
  record: Events.Documentary.Documentary;
}> = ({ record }) => {
  return <span>Documentary: {record.payload.title}</span>;
};

export const DocumentaryEditFormTab: React.FC<EditProps & { record?: any }> = (
  props
) => (
  <FormTab label="Payload" {...props}>
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const DocumentaryEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<DocumentaryReleaseTitle {...(props as any)} />}
    {...props}
    transform={(r) => transformEvent(r.id as any, r)}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <WebPreviewButton resource="/events" source="id" />
        <BooleanInput source="draft" defaultValue={false} />
        <TextInput fullWidth source="payload.title" />
        <TextInput type="url" fullWidth source="payload.website" />
        <DateInput source="date" />
        <ReferenceMediaInput
          allowedTypes={["video/mp4", "iframe/video"]}
          source="payload.media"
        />
        <ReactPageInput source="excerpt" onlyText />

        {/** Authors */}
        <ReferenceArrayActorInput
          source="payload.authors.actors"
          defaultValue={[]}
        />
        <ReferenceArrayGroupInput
          source="payload.authors.groups"
          defaultValue={[]}
        />

        {/** Subjects */}
        <ReferenceArrayActorInput
          source="payload.subjects.actors"
          defaultValue={[]}
        />
        <ReferenceArrayGroupInput
          source="payload.subjects.groups"
          defaultValue={[]}
        />
        <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Body">
        <ReactPageInput source="body" />
      </FormTab>
      <FormTab label="Location">
        <MapInput source="payload.location" type={MapInputType.POINT} />
      </FormTab>
      <FormTab label="Links">
        <ReferenceArrayLinkInput source="links" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const DocumentaryCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Documentary"
    {...props}
    transform={(data) =>
      transformEvent(uuid(), data).then((record) => ({
        ...record,
        payload: {
          ...record.payload,
          media: record.media[0],
        },
      }))
    }
  >
    <SimpleForm>
      <BooleanInput source="draft" defaultValue={false} />
      <TextInput fullWidth source="payload.title" />
      <TextInput type="url" fullWidth source="payload.website" />
      <DateInput source="date" />
      <ReferenceArrayMediaInput
        allowedTypes={["video/mp4", "iframe/video"]}
        source="newMedia"
      />
      <ReactPageInput source="excerpt" onlyText />
      {/** Authors */}
      <ReferenceArrayActorInput
        source="payload.authors.actors"
        defaultValue={[]}
      />
      <ReferenceArrayGroupInput
        source="payload.authors.groups"
        defaultValue={[]}
      />

      {/** Subjects */}
      <ReferenceArrayActorInput
        source="payload.subjects.actors"
        defaultValue={[]}
      />
      <ReferenceArrayGroupInput
        source="payload.subjects.groups"
        defaultValue={[]}
      />

      <ReactPageInput source="body" />

      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
      <ReferenceArrayLinkInput source="links" defaultValue={[]} />
    </SimpleForm>
  </Create>
);
