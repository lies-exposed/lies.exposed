import type * as Events from "@liexp/shared/io/http/Events";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import ExcerptField from "@liexp/ui/components/admin/common/ExcerptField";
import ReferenceActorInput from "@liexp/ui/components/admin/common/ReferenceActorInput";
import ReferenceArrayLinkInput from "@liexp/ui/components/admin/common/ReferenceArrayLinkInput";
import ReferenceArrayKeywordInput from "@liexp/ui/components/admin/keywords/ReferenceArrayKeywordInput";
import EventPreview from "@liexp/ui/components/admin/previews/EventPreview";
import { EventGeneralTab } from "@liexp/ui/components/admin/tabs/EventGeneralTab";
import { QuoteEditFormTab } from "@liexp/ui/components/admin/tabs/QuoteEditFormTab";
import { ReferenceLinkTab } from "@liexp/ui/components/admin/tabs/ReferenceLinkTab";
import { transformEvent } from "@liexp/ui/components/admin/transform.utils";
import * as React from "react";
import {
  BooleanInput,
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  List,
  type ListProps,
  ReferenceField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useRecordContext
} from "react-admin";
import { EventEditActions } from "./actions/EditEventActions";

const quotesFilter = [
  <ReferenceActorInput key="actor" source="actor" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <DateInput key="date" source="date" alwaysOn />,
];

export const QuoteList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={quotesFilter}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      draft: undefined,
    }}
  >
    <Datagrid rowClick="edit">
      <ReferenceField reference="actors" source="payload.actor">
        <TextField source="fullName" />
      </ReferenceField>
      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const QuoteTitle: React.FC = () => {
  const record = useRecordContext<Events.Quote.Quote>();
  return <span>Quote by: {record?.payload?.actor}</span>;
};

export const QuoteEdit: React.FC = () => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      title={<QuoteTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
      preview={<EventPreview />}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <EventGeneralTab>
            <QuoteEditFormTab />
          </EventGeneralTab>
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const QuoteCreate: React.FC<CreateProps> = () => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Add a quote"
      transform={(data) =>
        transformEvent(dataProvider)(uuid(), data).then((record) => ({
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
        <ReferenceActorInput source="payload.actor" />
        <DateInput source="date" />
        <ReactPageInput source="excerpt" onlyText />
        <TextInput source="payload.details" />

        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <ReferenceArrayLinkInput source="links" defaultValue={[]} />
      </SimpleForm>
    </Create>
  );
};
