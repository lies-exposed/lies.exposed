import * as io from "@liexp/shared/io";
import { http } from "@liexp/shared/io";
import { Events } from "@liexp/shared/io/http";
import { Documentary, Event } from "@liexp/shared/io/http/Events";
import { DEATH } from "@liexp/shared/io/http/Events/Death";
import { DOCUMENTARY } from "@liexp/shared/io/http/Events/Documentary";
import { PATENT } from "@liexp/shared/io/http/Events/Patent";
import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import { UNCATEGORIZED } from "@liexp/shared/io/http/Events/Uncategorized";
import { getTextContentsCapped } from "@liexp/ui/components/Common/Editor";
import { EventIcon } from "@liexp/ui/components/Common/Icons/EventIcon";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import { ValidationErrorsLayout } from "@liexp/ui/components/ValidationErrorsLayout";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Box, Typography } from "@material-ui/core";
import PinDropIcon from "@material-ui/icons/PinDrop";
import * as E from "fp-ts/lib/Either";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FormDataConsumer,
  FormTab,
  FunctionField,
  List,
  ListProps,
  Record,
  ReferenceArrayField,
  ReferenceField,
  SelectInput,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { LinkArrayInput } from "./Common/LinkArrayInput";
import { MediaArrayInput } from "./Common/MediaArrayInput";
import { MediaField } from "./Common/MediaField";
import ReferenceArrayActorInput from "./Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "./Common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "./Common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "./Common/ReferenceArrayKeywordInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";
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
  EditScientificStudyEvent,
  ScientificStudyEventTitle,
} from "./events/AdminScientificStudyEvent";
import {
  UncategorizedEventEditTab,
  UncategorizedEventTitle,
} from "./events/AdminUncategorizedEvent";
import { transformEvent } from "./events/utils";

const RESOURCE = "events";

const EventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput source="title" alwaysOn size="small" />
      <BooleanInput source="withDeleted" alwaysOn />
      <SelectInput
        source="type"
        alwaysOn
        size="small"
        choices={io.http.Events.EventType.types.map((t) => ({
          id: t.value,
          name: t.value,
        }))}
      />
      <ReferenceArrayKeywordInput source="keywords" alwaysOn />
      <ReferenceArrayGroupInput source="groups" />
      <ReferenceArrayActorInput source="actors" />
      <ReferenceArrayGroupMemberInput source="groupsMembers" />
      <DateInput source="startDate" />
      <DateInput source="endDate" />
    </Filter>
  );
};

export const EventList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filterDefaultValues={{
      _sort: "createdAt",
      _order: "DESC",
      withDeleted: true,
    }}
    filters={<EventsFilter />}
    perPage={20}
  >
    <Datagrid
      rowClick={(_props, _id, record) => {
        if (record.type === SCIENTIFIC_STUDY.value) {
          return `scientific-studies/${record.id}`;
        }
        if (record.type === DEATH.value) {
          return `deaths/${record.id}`;
        }
        return `events/${record.id}`;
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
            return 1;
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
      <FunctionField source="links" render={(r: any) => r.links?.length ?? 0} />
      <FunctionField source="media" render={(r: any) => r.media?.length ?? 0} />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
      <DateField source="deletedAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<any> = ({ record }: { record: Event }) => {
  switch (record.type) {
    case UNCATEGORIZED.value:
      return <UncategorizedEventTitle record={record} />;
    case SCIENTIFIC_STUDY.value:
      return <ScientificStudyEventTitle record={record} />;
    case DEATH.value:
      return <DeathEventTitle record={record} />;
    case PATENT.value:
      return <PatentEventTitle record={record} />;
    case DOCUMENTARY.value:
      return <DocumentaryReleaseTitle record={record} />;
  }
};

export const EventEdit: React.FC<EditProps> = (props: EditProps) => {
  return (
    <Edit
      title={<EditTitle {...props} />}
      {...props}
      actions={
        <>
          <WebPreviewButton
            resource="/dashboard/events"
            source="id"
            record={{ id: props.id } as any}
          />
        </>
      }
      transform={(r) => {
        // eslint-disable-next-line
        console.log("transform event for type", { type: r.type, event: r });
        return transformEvent(r.id as any, r);
      }}
    >
      <TabbedForm redirect={false}>
        <FormTab label="Generals">
          <TextField source="type" />
          <DateInput source="date" />
          <BooleanInput source="draft" />
          <ReactPageInput label="excerpt" source="excerpt" onlyText />
          <ReferenceArrayKeywordInput source="keywords" />
          <DateField source="updatedAt" showTime={true} />
          <DateField source="createdAt" showTime={true} />
        </FormTab>
        <FormTab label="body">
          <ReactPageInput label="body" source="body" />
        </FormTab>

        <FormDataConsumer>
          {({ formData, getSource, scopedFormData, ...rest }) => {
            if (formData.type === Documentary.DOCUMENTARY.value) {
              return <DocumentaryEditFormTab {...rest} />;
            }
            if (formData.type === "Death") {
              return <DeathEventEditFormTab {...rest} />;
            }
            if (formData.type === "ScientificStudy") {
              return <EditScientificStudyEvent {...rest} />;
            }
            return <UncategorizedEventEditTab {...rest} />;
          }}
        </FormDataConsumer>
        <FormTab label="Media">
          <MediaArrayInput
            label="media"
            source="newMedia"
            fullWidth={true}
            defaultValue={[]}
          />

          <ReferenceArrayField
            source="media"
            reference="media"
            sortBy="updatedAt"
            sortByOrder="DESC"
          >
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <MediaField source="location" fullWidth={false} />
              <TextField source="description" />
            </Datagrid>
          </ReferenceArrayField>
        </FormTab>
        <FormTab label="Links">
          <LinkArrayInput source="newLinks" />
          <ReferenceArrayField source="links" reference="links" fullWidth>
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <TextField source="title" />
              <DateField source="publishDate" />
              <TextField source="url" />
            </Datagrid>
          </ReferenceArrayField>
        </FormTab>
        <FormTab label="Preview">
          <FormDataConsumer>
            {({ formData, ...rest }) => {
              return pipe(
                http.Events.Uncategorized.Uncategorized.decode(formData),
                E.fold(ValidationErrorsLayout, (p) => (
                  <EventPageContent
                    event={{
                      ...p,
                      keywords: [],
                      links: [],
                    }}
                    onActorClick={() => undefined}
                    onGroupClick={() => undefined}
                    onKeywordClick={() => undefined}
                    onLinkClick={() => undefined}
                    onGroupMemberClick={() => undefined}
                  />
                ))
              );
            }}
          </FormDataConsumer>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};
