import { type http } from "@liexp/shared/lib/io";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm";
import { DeathEventEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/DeathEventEditFormTab";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput";
import { MediaArrayInput } from "@liexp/ui/lib/components/admin/media/input/MediaArrayInput";
import {
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  List,
  ReferenceField,
  ReferenceInput,
  SimpleForm,
  useDataProvider,
  useRecordContext,
  type CreateProps,
  type ListProps
} from "@liexp/ui/lib/components/admin/react-admin";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils";
import * as React from "react";

const deathEventsFilter = [
  <ReferenceArrayActorInput
    key="victim"
    label="Victim"
    source="victim"
    size="small"
    alwaysOn
  />,
  <BooleanInput
    key="withDrafts"
    label="Draft ?"
    source="draft"
    size="small"
    alwaysOn
  />,
  <DateInput key="date" source="date" size="small" />,
];

export const DeathList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={deathEventsFilter}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      withDrafts: false,
      draft: true,
      victim: undefined,
    }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <ReferenceField source="payload.victim" reference="actors">
        <AvatarField source="avatar" />
      </ReferenceField>
      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const DeathEventTitle: React.FC = () => {
  const record = useRecordContext<http.Events.Death.Death>();
  return (
    <span>
      Event: {record?.payload?.victim} on {record?.date.toString()}
    </span>
  );
};

export const DeathEdit: React.FC = () => {
  return (
    <EditEventForm title={<DeathEventTitle />}>
      <DeathEventEditFormTab />
    </EditEventForm>
  );
};

export const DeathCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Death Event"
      {...props}
      transform={(data) => transformEvent(dataProvider)(uuid(), data)}
    >
      <SimpleForm>
        <BooleanInput source="draft" defaultValue={false} />
        <ReactPageInput source="excerpt" onlyText />
        <ReactPageInput source="body" />
        <ReferenceInput
          source="payload.victim"
          reference="actors"
          filterToQuery={(fullName) => ({ fullName })}
        >
          <AutocompleteInput source="id" optionText="fullName" />
        </ReferenceInput>
        <DateInput source="date" />
        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <ReferenceArrayLinkInput source="links" defaultValue={[]} />
        <MediaArrayInput
          label="media"
          source="newMedia"
          fullWidth={true}
          defaultValue={[]}
        />
      </SimpleForm>
    </Create>
  );
};
