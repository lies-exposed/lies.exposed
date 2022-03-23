import { EventIcon } from "@liexp/ui/components/Common/Icons";
import { Box, Typography, ThemeProvider } from "@material-ui/core";
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
} from "ra-ui-materialui";
import * as React from "react";
import * as io from "@liexp/shared/io";
import { WebPreviewButton } from "components/Common/WebPreviewButton";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import ReferenceArrayKeywordInput from "components/Common/ReferenceArrayKeywordInput";
import { transformEvent } from "../utils";
import { FormDataConsumer } from "ra-core";
import { Documentary } from "@liexp/shared/io/http/Events";
import { DocumentaryEditFormTab } from "../AdminDocumentaryEvent";
import { DeathEventEditFormTab } from "../AdminDeathEvent";
import { EditScientificStudyEvent } from "../AdminScientificStudyEvent";
import { UncategorizedEventEditTab } from "../AdminUncategorizedEvent";
import { MediaArrayInput } from "components/Common/MediaArrayInput";
import { MediaField } from "components/Common/MediaField";
import { LinkArrayInput } from "components/Common/LinkArrayInput";
import { pipe } from "fp-ts/lib/function";
import { ValidationErrorsLayout } from "@liexp/ui/components/ValidationErrorsLayout";
import { ECOTheme } from "@liexp/ui/theme";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import * as http from "@liexp/shared/io/http";
import { EditTitle } from "../../AdminEvents";
import * as E from "fp-ts/lib/Either";
import { uuid } from "@liexp/shared/utils/uuid";

const RESOURCE = "events/suggestions";

export const EventSuggestionList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filterDefaultValues={{
      _sort: "createdAt",
      _order: "DESC",
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
      transform={(r) => {
        // eslint-disable-next-line
        console.log("transform event for type", { type: r.type, event: r });
        return transformEvent(r.id as any, r.payload.event).then((event) => ({
          ...r,
          event,
        }));
      }}
    >
      <TabbedForm redirect={false}>
        <FormTab label="Generals">
          <TextField label="type" source="payload.event.type" />
          <DateInput label="dte" source="payload.event.date" />
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
            if (formData.payload.event.type === Documentary.DOCUMENTARY.value) {
              return (
                <DocumentaryEditFormTab
                  {...rest}
                  record={formData.payload.event}
                />
              );
            }
            if (formData.payload.event.type === "Death") {
              return (
                <DeathEventEditFormTab
                  {...rest}
                  record={formData.payload.event}
                />
              );
            }
            if (formData.payload.event.type === "ScientificStudy") {
              return (
                <EditScientificStudyEvent
                  {...rest}
                  record={formData.payload.event}
                />
              );
            }
            return (
              <UncategorizedEventEditTab
                {...rest}
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
