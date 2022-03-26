import { Death } from "@liexp/shared/io/http/Events";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import {
  MapInput,
  MapInputType
} from "@liexp/ui/src/components/admin/MapInput";
import * as React from "react";
import {
  AutocompleteInput, BooleanField, BooleanInput, Create,
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
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TabbedForm
} from "react-admin";
import { AvatarField } from "../Common/AvatarField";
import ExcerptField from "../Common/ExcerptField";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import ReferenceActorInput from "../Common/ReferenceActorInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import { ReferenceMediaDataGrid } from "../Common/ReferenceMediaDataGrid";
import { TGPostButton } from '../Common/TGPostButton';
import { WebPreviewButton } from "../Common/WebPreviewButton";
import { transformEvent } from "./utils";

const DeathEventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <BooleanInput label="Draft only" source="withDrafts" alwaysOn />
      <ReferenceActorInput source="victim" alwaysOn />
      <DateInput source="date" />
    </Filter>
  );
};

export const DeathList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={<DeathEventsFilter />}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      withDrafts: false,
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

export const DeathEventTitle: React.FC<{ record: Death.Death }> = ({
  record,
}) => {
  return (
    <span>
      Event: {record.payload.victim} on {record.date}
    </span>
  );
};

export const DeathEventEditFormTab: React.FC<EditProps & { record?: any }> = (
  props
) => (
  <FormTab label="Payload" {...props}>
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const DeathEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<DeathEventTitle {...(props as any)} />}
    {...props}
    actions={
      <>
        <WebPreviewButton resource="/dashboard/events" source="id" {...props} />
        <TGPostButton id={props.id} />
      </>
    }
    transform={(r) => transformEvent(r.id as any, r)}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <BooleanInput source="draft" defaultValue={false} />
        <ReferenceInput
          source="payload.victim"
          reference="actors"
          filterToQuery={(f) => ({ id: f })}
        >
          <SelectInput
            optionText={(r: any) => {
              if (r) {
                return `${r.fullName}`;
              }
              return "Unknown";
            }}
          />
        </ReferenceInput>
        <DateInput source="date" />
        <ReactPageInput source="excerpt" onlyText />
        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Body">
        <ReactPageInput source="body" />
      </FormTab>
      <FormTab label="Location">
        <MapInput source="payload.location" type={MapInputType.POINT} />
      </FormTab>
      <FormTab label="Media">
        <MediaArrayInput source="newMedia" defaultValue={[]} fullWidth />
        <ReferenceMediaDataGrid source="media" />
      </FormTab>
      <FormTab label="Links">
        <ReferenceArrayLinkInput source="links" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const DeathCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Death Event"
    {...props}
    transform={(data) => transformEvent(uuid(), data)}
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
      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} showAdd />
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
