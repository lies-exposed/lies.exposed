import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { DeathEventEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/DeathEventEditFormTab.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput.js";
import { MediaArrayInput } from "@liexp/ui/lib/components/admin/media/input/MediaArrayInput.js";
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
  type CreateProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
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

export const DeathEdit: React.FC = () => {
  return (
    <EditEventForm>
      {() => <DeathEventEditFormTab />}
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
