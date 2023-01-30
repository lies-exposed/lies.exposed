import * as io from "@liexp/shared/io";
import { http } from "@liexp/shared/io";
import { Events } from "@liexp/shared/io/http";
import {
  Death,
  Documentary,
  EventType,
  Quote,
  ScientificStudy,
} from "@liexp/shared/io/http/Events";
import { getTextContentsCapped } from "@liexp/shared/slate";
import { LinkIcon } from '@liexp/ui/components/Common/Icons';
import { EventIcon } from "@liexp/ui/components/Common/Icons/EventIcon";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import ReferenceArrayActorInput from "@liexp/ui/components/admin/common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "@liexp/ui/components/admin/common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "@liexp/ui/components/admin/common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "@liexp/ui/components/admin/keywords/ReferenceArrayKeywordInput";
import { ImportMediaButton } from "@liexp/ui/components/admin/media/ImportMediaButton";
import EventPreview from "@liexp/ui/components/admin/previews/EventPreview";
import { DeathEventEditFormTab } from "@liexp/ui/components/admin/tabs/DeathEventEditFormTab";
import { DocumentaryEditFormTab } from "@liexp/ui/components/admin/tabs/DocumentaryEditFormTab";
import { EventGeneralTab } from "@liexp/ui/components/admin/tabs/EventGeneralTab";
import { QuoteEditFormTab } from "@liexp/ui/components/admin/tabs/QuoteEditFormTab";
import { ReferenceLinkTab } from "@liexp/ui/components/admin/tabs/ReferenceLinkTab";
import { ReferenceMediaTab } from "@liexp/ui/components/admin/tabs/ReferenceMediaTab";
import { ScientificStudyEventEditTab } from "@liexp/ui/components/admin/tabs/ScientificStudyEventEditTab";
import { UncategorizedEventEditTab } from "@liexp/ui/components/admin/tabs/UncategorizedEventEditTab";
import { transformEvent } from "@liexp/ui/components/admin/transform.utils";
import {
  alpha,
  Box,
  Card,
  CardContent,
  PlayCircleOutline,
  Typography,
} from "@liexp/ui/components/mui";
import PinDropIcon from "@mui/icons-material/PinDrop";
import * as R from "fp-ts/Record";
import * as React from "react";
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
  type RaRecord as Record,
  ReferenceField,
  SavedQueriesList,
  TabbedForm,
  TextField,
  useDataProvider,
  useRecordContext,
} from "react-admin";
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
          <FilterList label="Media" icon={<PlayCircleOutline  />}>
            <FilterListItem label="Empty Media" value={{ emptyMedia: true }} />
          </FilterList>
          <FilterList label="Links" icon={<LinkIcon  />}>
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
                value={{ type: [t.value] }}
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
          backgroundColor: record.deletedAt ? alpha("#FF0000", 20) : undefined,
        };
      }}
      rowClick={(_props, _id, record) => {
        if (
          record.type === http.Events.ScientificStudy.SCIENTIFIC_STUDY.value
        ) {
          return `/scientific-studies/${record.id}`;
        }

        if (record.type === http.Events.Death.DEATH.value) {
          return `/deaths/${record.id}`;
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
                io.http.Events.Uncategorized.UNCATEGORIZED.value,
                io.http.Events.ScientificStudy.SCIENTIFIC_STUDY.value,
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
          if (r?.type === Events.Uncategorized.UNCATEGORIZED.value) {
            return r.payload.actors.length;
          }

          if (r?.type === Events.ScientificStudy.SCIENTIFIC_STUDY.value) {
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
          if (r?.type === http.Events.Uncategorized.UNCATEGORIZED.value) {
            return r.payload.groupsMembers.length;
          }

          if (r?.type === http.Events.ScientificStudy.SCIENTIFIC_STUDY.value) {
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
      case http.Events.Uncategorized.UNCATEGORIZED.value:
        return <UncategorizedEventTitle />;
      case http.Events.ScientificStudy.SCIENTIFIC_STUDY.value:
        return <ScientificStudyEventTitle />;
      case http.Events.Death.DEATH.value:
        return <DeathEventTitle />;
      case http.Events.Patent.PATENT.value:
        return <PatentEventTitle />;
      case http.Events.Documentary.DOCUMENTARY.value:
        return <DocumentaryReleaseTitle />;
      case http.Events.Transaction.TRANSACTION.value:
        return <TransactionTitle record={record} />;
      case http.Events.Quote.QUOTE.value:
        return <QuoteTitle />;
    }
  }
  return <span>No record</span>;
};

export const EventEdit: React.FC = () => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
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
                if (formData.type === Documentary.DOCUMENTARY.value) {
                  return <DocumentaryEditFormTab />;
                }
                if (formData.type === Death.DEATH.value) {
                  return <DeathEventEditFormTab />;
                }
                if (formData.type === ScientificStudy.SCIENTIFIC_STUDY.value) {
                  return <ScientificStudyEventEditTab />;
                }
                if (formData.type === Quote.QUOTE.value) {
                  return <QuoteEditFormTab />;
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
