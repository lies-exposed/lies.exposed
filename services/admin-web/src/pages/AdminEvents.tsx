import * as io from "@liexp/shared/io";
import { http } from "@liexp/shared/io";
import { Events } from "@liexp/shared/io/http";
import {
  Death,
  Documentary,
  ScientificStudy,
} from "@liexp/shared/io/http/Events";
import { DEATH } from "@liexp/shared/io/http/Events/Death";
import { DOCUMENTARY } from "@liexp/shared/io/http/Events/Documentary";
import { PATENT } from "@liexp/shared/io/http/Events/Patent";
import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import { TRANSACTION } from "@liexp/shared/io/http/Events/Transaction";
import { UNCATEGORIZED } from "@liexp/shared/io/http/Events/Uncategorized";
import { getTextContentsCapped } from "@liexp/shared/slate";
import { EventIcon } from "@liexp/ui/components/Common/Icons/EventIcon";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Box, Typography } from "@liexp/ui/components/mui";
import PinDropIcon from "@mui/icons-material/PinDrop";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  FormDataConsumer,
  FormTab,
  FunctionField,
  List,
  RaRecord as Record,
  ReferenceField,
  SelectInput,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
} from "react-admin";
import { EditFormWithPreview } from "../components/Common/EditEventForm";
import { ImportMediaButton } from "../components/Common/ImportMediaButton";
import ReferenceArrayActorInput from "../components/Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../components/Common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "../components/Common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "../components/Common/ReferenceArrayKeywordInput";
import EventPreview from "../components/previews/EventPreview";
import { EventGeneralTab } from "../components/tabs/EventGeneralTab";
import { ReferenceLinkTab } from "../components/tabs/ReferenceLinkTab";
import { ReferenceMediaTab } from "../components/tabs/ReferenceMediaTab";
import { transformEvent } from "../utils";
import {
  DeathEventEditFormTab,
  DeathEventTitle,
} from "./events/AdminDeathEvent";
import {
  DocumentaryEditFormTab,
  DocumentaryReleaseTitle,
} from "./events/AdminDocumentaryEvent";
import { PatentEventTitle } from "./events/AdminPatentEvent";
import {
  EditScientificStudyEventPayload,
  ScientificStudyEventTitle,
} from "./events/AdminScientificStudyEvent";
import { TransactionTitle } from "./events/AdminTransactionEvent";
import {
  UncategorizedEventEditTab,
  UncategorizedEventTitle,
} from "./events/AdminUncategorizedEvent";
import { EventEditActions } from "./events/actions/EditEventActions";

const RESOURCE = "events";

const eventsFilter = [
  <TextInput key="title" source="title" alwaysOn size="small" />,
  <BooleanInput
    key="draft"
    label="Draft"
    source="draft"
    defaultValue={false}
    alwaysOn
    size="small"
  />,
  <BooleanInput key="withDeleted" source="withDeleted" alwaysOn size="small" />,
  <SelectInput
    key="type[]"
    source="type"
    alwaysOn
    size="small"
    choices={io.http.Events.EventType.types.map((t) => ({
      id: t.value,
      name: t.value,
    }))}
  />,
  <ReferenceArrayKeywordInput
    key="keywords"
    source="keywords"
    showAdd={false}
    alwaysOn
  />,
  <ReferenceArrayGroupInput key="groups" source="groups" />,
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
  >
    <Datagrid
      rowClick={(_props, _id, record) => {
        if (record.type === SCIENTIFIC_STUDY.value) {
          return `/scientific-studies/${record.id}`;
        }
        if (record.type === DEATH.value) {
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
          if (r?.type === "Uncategorized") {
            return r.payload.groupsMembers.length;
          }

          if (r?.type === "ScientificStudy") {
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
      <FunctionField
        label="Dates"
        render={(r: Record | undefined) => {
          return (
            <Box>
              <DateField source="updatedAt" />
              <DateField source="createdAt" />
              <DateField source="deletedAt" />
            </Box>
          );
        }}
      />
    </Datagrid>
  </List>
);

export const EditTitle: React.FC = () => {
  const record = useRecordContext<http.Events.Event>();
  if (record) {
    switch (record.type) {
      case UNCATEGORIZED.value:
        return <UncategorizedEventTitle />;
      case SCIENTIFIC_STUDY.value:
        return <ScientificStudyEventTitle />;
      case DEATH.value:
        return <DeathEventTitle />;
      case PATENT.value:
        return <PatentEventTitle />;
      case DOCUMENTARY.value:
        return <DocumentaryReleaseTitle />;
      case TRANSACTION.value:
        return <TransactionTitle record={record} />;
    }
  }
  return <span>No record</span>;
};

export const EventEdit: React.FC = () => {
  return (
    <EditFormWithPreview
      title={<EditTitle />}
      redirect={false}
      actions={<EventEditActions />}
      preview={<EventPreview />}
      transform={(r) => transformEvent(r.id, r)}
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
                  return <EditScientificStudyEventPayload />;
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
          <ReferenceMediaTab source="media" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </EditFormWithPreview>
  );
};
