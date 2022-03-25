import * as io from "@liexp/shared/io";
import {
  Documentary,
  EventSuggestionStatus,
  Patent,
} from "@liexp/shared/io/http/Events";
import { EventIcon } from "@liexp/ui/components/Common/Icons";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { ECOTheme } from "@liexp/ui/theme";
import { Box, ThemeProvider, Typography } from "@material-ui/core";
import { FormDataConsumer } from "ra-core";
import {
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormTab,
  FunctionField,
  List,
  ListProps,
  ReferenceArrayField,
  ReferenceField,
  TabbedForm,
  TextField,
  Filter,
  SelectInput,
} from "ra-ui-materialui";
import * as React from "react";
import { LinkArrayInput } from "../../Common/LinkArrayInput";
import { MediaArrayInput } from "../../Common/MediaArrayInput";
import { MediaField } from "../../Common/MediaField";
import ReferenceArrayKeywordInput from "../../Common/ReferenceArrayKeywordInput";
import { WebPreviewButton } from "../../Common/WebPreviewButton";
import { DeathEventEditFormTab } from "../AdminDeathEvent";
import { DocumentaryEditFormTab } from "../AdminDocumentaryEvent";
import { PatentEventEditFormTab } from '../AdminPatentEvent';
import { EditScientificStudyEvent } from "../AdminScientificStudyEvent";
import { UncategorizedEventEditTab } from "../AdminUncategorizedEvent";
import { transformEvent } from "../utils";

const RESOURCE = "events/suggestions";

const EventSuggestionListFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <SelectInput
        source="status"
        choices={EventSuggestionStatus.types.map((tt) => ({
          name: tt.value,
          id: tt.value,
        }))}
        alwaysOpen
      />
    </Filter>
  );
};

export const EventSuggestionList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filters={<EventSuggestionListFilter />}
    filterDefaultValues={{
      _sort: "createdAt",
      _order: "DESC",
      status: "PENDING",
      withDeleted: true,
    }}
    perPage={20}
  >
    <Datagrid rowClick="edit">
      <FunctionField
        label="type"
        render={(r: any) => {
          return (
            <Box>
              <EventIcon color="primary" type={r.payload.event.type} />{" "}
              <Typography display="inline" variant="subtitle1">
                {r.payload.type}
              </Typography>{" "}
              {[
                io.http.Events.Uncategorized.UNCATEGORIZED.value,
                io.http.Events.ScientificStudy.SCIENTIFIC_STUDY.value,
              ].includes(r.payload.event.type) ? (
                <Typography>{r.payload.event.payload.title}</Typography>
              ) : (
                <ReferenceField
                  source="payload.event.payload.victim"
                  reference="actors"
                >
                  <TextField source="username" />
                </ReferenceField>
              )}
            </Box>
          );
        }}
      />
      <TextField source="status" />
      <DateField source="payload.event.date" />
      <FunctionField
        source="payload.event.links"
        render={(r: any) => r.links?.length ?? 0}
      />
      <FunctionField
        source="payload.media"
        render={(r: any) => r.media?.length ?? 0}
      />
    </Datagrid>
  </List>
);

export const EventSuggestionEdit: React.FC<EditProps> = (props: EditProps) => {
  return (
    <Edit
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
      transform={async ({ event, id, ...r }) => {
        // eslint-disable-next-line
        console.log("transform event for type", {
          type: r.type,
          event: r.payload.event,
        });

        const updatedEvent = await transformEvent(id as any, r.payload.event);

        return { id, ...r.payload, event: updatedEvent };
      }}
    >
      <TabbedForm redirect={false}>
        <FormTab label="Generals">
          <TextField label="Suggestion type" source="payload.type" />
          <TextField label="Suggestion status" source="status" />
          <DateInput label="date" source="payload.event.date" />
          <BooleanInput label="draft" source="payload.event.draft" />
          <ReactPageInput
            label="excerpt"
            source="payload.event.excerpt"
            onlyText
          />
          <ReferenceArrayKeywordInput source="payload.event.keywords" />
          <DateField
            label="updatedAt"
            source="payload.event.updatedAt"
            showTime={true}
          />
          <DateField
            label="createdAt"
            source="payload.event.createdAt"
            showTime={true}
          />
        </FormTab>
        <FormTab label="body">
          <ReactPageInput label="body" source="payload.event.body" />
        </FormTab>

        <FormDataConsumer>
          {({ formData, getSource, scopedFormData, ...rest }) => {
            // console.log({ formData, scopedFormData, rest });

            if (formData.payload.event.type === Documentary.DOCUMENTARY.value) {
              return <DocumentaryEditFormTab {...rest} />;
            }
            if (formData.payload.event.type === "Death") {
              return <DeathEventEditFormTab {...rest} />;
            }
            if (formData.payload.event.type === "ScientificStudy") {
              return <EditScientificStudyEvent {...rest} />;
            }
            if (formData.payload.event.type === Patent.PATENT.value) {
              return <PatentEventEditFormTab {...rest} sourcePrefix={"payload.event"} />
            }
            return (
              <UncategorizedEventEditTab
                {...rest}
                sourcePrefix={"payload.event"}
                record={formData.payload.event}
              />
            );
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
            source="payload.event.media"
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
          <LinkArrayInput source="payload.event.links" />
        </FormTab>
        <FormTab label="Preview">
          <FormDataConsumer>
            {({ formData, ...rest }) => {
              return (
                <ThemeProvider theme={ECOTheme}>
                  {formData.payload.event.type === "Uncategorized" ? (
                    <EventPageContent
                      event={{
                        ...formData.payload.event,
                        excerpt: undefined,
                        body: undefined,
                        keywords: [],
                        links: [],
                      }}
                      onActorClick={() => undefined}
                      onGroupClick={() => undefined}
                      onKeywordClick={() => undefined}
                      onLinkClick={() => undefined}
                      onGroupMemberClick={() => undefined}
                    />
                  ) : (
                    <div />
                  )}
                </ThemeProvider>
              );
            }}
          </FormDataConsumer>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};
