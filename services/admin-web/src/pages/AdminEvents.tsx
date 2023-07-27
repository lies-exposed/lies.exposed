import * as io from "@liexp/shared/lib/io";
import { http } from "@liexp/shared/lib/io";
import { Events } from "@liexp/shared/lib/io/http";
import {
  EventType,
  EventTypes
} from "@liexp/shared/lib/io/http/Events";
import { getTextContentsCapped } from "@liexp/shared/lib/slate";
import { LinkIcon } from "@liexp/ui/lib/components/Common/Icons";
import { EventIcon } from "@liexp/ui/lib/components/Common/Icons/EventIcon";
import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  FormDataConsumer,
  FormTab,
  FunctionField,
  List,
  ReferenceField,
  SavedQueriesList,
  TabbedForm,
  TextField,
  useDataProvider,
  useRecordContext,
  type RaRecord as Record,
} from "@liexp/ui/lib/components/admin";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm";
import ReferenceArrayGroupMemberInput from "@liexp/ui/lib/components/admin/common/ReferenceArrayGroupMemberInput";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput";
import { ImportMediaButton } from "@liexp/ui/lib/components/admin/media/button/ImportMediaButton";
import EventPreview from "@liexp/ui/lib/components/admin/previews/EventPreview";
import { DeathEventEditFormTab } from "@liexp/ui/lib/components/admin/tabs/DeathEventEditFormTab";
import { DocumentaryEditFormTab } from "@liexp/ui/lib/components/admin/tabs/DocumentaryEditFormTab";
import { EventGeneralTab } from "@liexp/ui/lib/components/admin/tabs/EventGeneralTab";
import { PatentEventEditFormTab } from "@liexp/ui/lib/components/admin/tabs/PatentEventEditTab";
import { QuoteEditFormTab } from "@liexp/ui/lib/components/admin/tabs/QuoteEditFormTab";
import { ReferenceLinkTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceLinkTab";
import { ReferenceMediaTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceMediaTab";
import { ScientificStudyEventEditTab } from "@liexp/ui/lib/components/admin/tabs/ScientificStudyEventEditTab";
import { UncategorizedEventEditTab } from "@liexp/ui/lib/components/admin/tabs/UncategorizedEventEditTab";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils";
import {
  Box,
  Card,
  CardContent,
  PlayCircleOutline,
  Typography,
  alpha,
} from "@liexp/ui/lib/components/mui";
import PinDropIcon from "@mui/icons-material/PinDrop";
import * as R from "fp-ts/Record";
import * as React from "react";
import { DeathEventTitle } from "./events/AdminDeathEvent";
import { DocumentaryReleaseTitle } from "./events/AdminDocumentaryEvent";
import { PatentEventTitle } from "./events/AdminPatentEvent";
import { QuoteTitle } from "./events/AdminQuoteEvent";
import { ScientificStudyEventTitle } from "./events/AdminScientificStudyEvent";
import { TransactionTitle } from "./events/AdminTransactionEvent";
import { UncategorizedEventTitle } from "./events/AdminUncategorizedEvent";
import { EventEditActions } from "./events/actions/EditEventActions";

const RESOURCE = "events";

const eventsFilter = [
  <ReferenceArrayKeywordInput
    key="keywords"
    source="keywords"
    showAdd={false}
    alwaysOn
  />,
  <BooleanInput
    key="draft"
    label="Draft"
    source="draft"
    defaultValue={false}
    alwaysOn
    size="small"
  />,
  <BooleanInput key="withDeleted" source="withDeleted" alwaysOn size="small" />,
  <ReferenceArrayGroupInput key="groups" source="groups" size="small" />,
  <ReferenceArrayActorInput key="actors" source="actors" />,
  <ReferenceArrayGroupMemberInput key="groupsMembers" source="groupsMembers" />,
  <DateInput key="startDate" source="startDate" />,
  <DateInput key="endDate" source="endDate" />,
];

export const EventList: React.FC = () => (
  <List
    resource={RESOURCE}
    filterDefaultValues={{
      withDeleted: true,
      draft: undefined,
    }}
    filters={eventsFilter}
    perPage={20}
    sort={{ field: "createdAt", order: "DESC" }}
    aside={
      <Card
        sx={{
          order: -1,
          mr: 2,
          mt: 0,
          width: 300,
          display: "flex",
          flex: "1 0 auto",
        }}
      >
        <CardContent>
          <SavedQueriesList />
          <FilterLiveSearch source="title" />
          <FilterList label="Media" icon={<PlayCircleOutline />}>
            <FilterListItem label="Empty Media" value={{ emptyMedia: true }} />
          </FilterList>
          <FilterList label="Links" icon={<LinkIcon />}>
            <FilterListItem label="Empty Links" value={{ emptyLinks: true }} />
          </FilterList>
          <FilterList label="Type" icon={<EventIcon type="Uncategorized" />}>
            {EventType.types.map((t) => (
              <FilterListItem
                key={t.value}
                label={
                  <span>
                    <EventIcon type={t.value} /> {t.value}
                  </span>
                }
                value={{ eventType: [t.value] }}
              />
            ))}
          </FilterList>
        </CardContent>
      </Card>
    }
  >
    <Datagrid
      rowStyle={(record) => {
        return {
          backgroundColor: record.deletedAt ? alpha("#FF0000", 0.6) : undefined,
        };
      }}
      rowClick={(_props, _id, record) => {
        if (record.type === http.Events.EventTypes.SCIENTIFIC_STUDY.value) {
          return `/scientific-studies/${record.id}`;
        }

        if (record.type === http.Events.EventTypes.DEATH.value) {
          return `/deaths/${record.id}`;
        }

        if (record.type === http.Events.EventTypes.PATENT.value) {
          return `/patents/${record.id}`;
        }

        if (record.type === http.Events.EventTypes.DOCUMENTARY.value) {
          return `/documentaries/${record.id}`;
        }

        if (record.type === http.Events.EventTypes.TRANSACTION.value) {
          return `/transactions/${record.id}`;
        }

        return `/events/${record.id}`;
      }}
    >
      <BooleanField source="draft" />
      <FunctionField
        label="type"
        render={(r: any) => {
          return (
            <Box>
              <EventIcon color="primary" type={r.type} />
              <Typography display="inline" variant="subtitle1">
                {r.type}
              </Typography>{" "}
              {[
                io.http.Events.EventTypes.UNCATEGORIZED.value,
                io.http.Events.EventTypes.SCIENTIFIC_STUDY.value,
              ].includes(r.type) ? (
                <Typography>{r.payload.title}</Typography>
              ) : (
                <ReferenceField source="payload.victim" reference="actors">
                  <TextField source="username" />
                </ReferenceField>
              )}
            </Box>
          );
        }}
      />
      <FunctionField
        label="excerpt"
        render={(r: any) => {
          return !R.isEmpty(r.excerpt)
            ? getTextContentsCapped(r.excerpt, 60)
            : "";
        }}
      />
      <FunctionField source="links" render={(r: any) => r.links?.length ?? 0} />
      <FunctionField source="media" render={(r: any) => r.media?.length ?? 0} />
      <FunctionField
        label="actors"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === Events.EventTypes.UNCATEGORIZED.value) {
            return r.payload.actors.length;
          }

          if (r?.type === Events.EventTypes.SCIENTIFIC_STUDY.value) {
            return r.payload.authors.length;
          }

          return 1;
        }}
      />

      <FunctionField
        label="groups"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === "Uncategorized") {
            return r.payload.groups.length;
          }

          if (r?.type === "ScientificStudy") {
            return r.payload.publisher ? 1 : 0;
          }

          return 0;
        }}
      />
      <FunctionField
        label="groupsMembers"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === http.Events.EventTypes.UNCATEGORIZED.value) {
            return r.payload.groupsMembers.length;
          }

          if (r?.type === http.Events.EventTypes.SCIENTIFIC_STUDY.value) {
            return 0;
          }

          return 1;
        }}
      />
      <FunctionField
        label="Location"
        source="payload.location.coordinates"
        render={(r: Record | undefined) =>
          r?.location?.coordinates ? <PinDropIcon /> : "-"
        }
      />

      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const EditTitle: React.FC = () => {
  const record = useRecordContext<http.Events.Event>();
  if (record) {
    switch (record.type) {
      case http.Events.EventTypes.UNCATEGORIZED.value:
        return <UncategorizedEventTitle />;
      case http.Events.EventTypes.SCIENTIFIC_STUDY.value:
        return <ScientificStudyEventTitle />;
      case http.Events.EventTypes.DEATH.value:
        return <DeathEventTitle />;
      case http.Events.EventTypes.PATENT.value:
        return <PatentEventTitle />;
      case http.Events.EventTypes.DOCUMENTARY.value:
        return <DocumentaryReleaseTitle />;
      case http.Events.EventTypes.TRANSACTION.value:
        return <TransactionTitle record={record} />;
      case http.Events.EventTypes.QUOTE.value:
        return <QuoteTitle />;
    }
  }
  return <span>No record</span>;
};

export const EventEdit: React.FC = (props) => {
  const dataProvider = useDataProvider();

  return (
    <EditForm
      {...props}
      title={<EditTitle />}
      redirect={false}
      actions={<EventEditActions />}
      preview={<EventPreview />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <EventGeneralTab>
            <FormDataConsumer>
              {({ formData, getSource, scopedFormData, ...rest }) => {
                if (formData.type === EventTypes.DOCUMENTARY.value) {
                  return <DocumentaryEditFormTab />;
                }
                if (formData.type === EventTypes.DEATH.value) {
                  return <DeathEventEditFormTab />;
                }
                if (formData.type === EventTypes.SCIENTIFIC_STUDY.value) {
                  return <ScientificStudyEventEditTab />;
                }
                if (formData.type === EventTypes.QUOTE.value) {
                  return <QuoteEditFormTab />;
                }
                if (formData.type === EventTypes.PATENT.value) {
                  return <PatentEventEditFormTab />;
                }
                return <UncategorizedEventEditTab />;
              }}
            </FormDataConsumer>
          </EventGeneralTab>
        </FormTab>
        <FormTab label="body">
          <ReactPageInput label="body" source="body" />
        </FormTab>

        <FormTab label="Media">
          <ImportMediaButton />
          <ReferenceMediaTab source="media" fullWidth />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};
