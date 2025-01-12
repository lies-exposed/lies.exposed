import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import { OpenAISummarizeQueueType } from "@liexp/shared/lib/io/http/Queue.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { EntitreeGraph } from "@liexp/ui/lib/components/Common/Graph/Flow/EntitreeGraph/EntitreeGraph.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import { CreateEventButton } from "@liexp/ui/lib/components/admin/events/CreateEventButton.js";
import ReferenceManyEventField from "@liexp/ui/lib/components/admin/events/ReferenceManyEventField.js";
import { EventsFlowGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsFlowGraphFormTab.js";
import { EventsNetworkGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsNetworkGraphFormTab.js";
import ReferenceGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceGroupInput.js";
import { SearchLinksButton } from "@liexp/ui/lib/components/admin/links/SearchLinksButton.js";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField.js";
import { OpenAIEmbeddingJobButton } from "@liexp/ui/lib/components/admin/media/OpenAIJobButton.js";
import ReferenceMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInput.js";
import ActorPreview from "@liexp/ui/lib/components/admin/previews/ActorPreview.js";
import {
  ArrayInput,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  FunctionField,
  ImageField,
  ImageInput,
  ReferenceArrayField,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  useRecordContext,
  type EditProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { LazyFormTabContent } from "@liexp/ui/lib/components/admin/tabs/LazyFormTabContent.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { transformActor } from "./ActorCreate";

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Actor {record?.fullName}</span>;
};

const EditActions: React.FC = () => {
  const record = useRecordContext();
  return (
    <>
      {record?.fullName ? <SearchLinksButton query={record.fullName} /> : null}
    </>
  );
};

const ActorEdit: React.FC<EditProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      title={<EditTitle />}
      {...props}
      actions={<EditActions />}
      preview={<ActorPreview />}
      transform={(a) => transformActor(dataProvider)(a.id, a)}
    >
      <TabbedForm>
        <FormTab label="generals">
          <MediaField
            source="avatar.thumbnail"
            type="image/jpeg"
            controls={false}
          />
          <ColorInput source="color" />
          <TextWithSlugInput source="fullName" slugSource="username" />
          <DateInput source="bornOn" />
          <DateInput source="diedOn" />
          <OpenAIEmbeddingJobButton<Actor>
            resource="actors"
            type={OpenAISummarizeQueueType.value}
            transformValue={({ excerpt, fullName }) =>
              pipe(
                excerpt ? getTextContents(excerpt) : "",
                (text) => (text !== "" ? text : fullName),
                (text) => ({ text }),
              )
            }
          />
          <BlockNoteInput source="excerpt" onlyText={true} />
          <DateField source="createdAt" />
          <DateField source="updatedAt" />
        </FormTab>
        <FormTab label="Avatar">
          <ReferenceMediaInput source="avatar.id" />
          <FunctionField
            render={(r) => {
              if (!r.avatar) {
                return (
                  <ImageInput source="avatar">
                    <ImageField source="thumbnail" />
                  </ImageInput>
                );
              }
              return null;
            }}
          />
        </FormTab>

        <FormTab label="Content">
          <BlockNoteInput source="body" />
        </FormTab>

        <FormTab label="Groups">
          <ArrayInput source="newMemberIn" defaultValue={[]} fullWidth>
            <SimpleFormIterator fullWidth>
              <ReferenceGroupInput source="group" />
              <DateInput source="startDate" />
              <DateInput source="endDate" />
              <BlockNoteInput onlyText={true} source="body" />
            </SimpleFormIterator>
          </ArrayInput>

          <ReferenceArrayField source="memberIn" reference="groups-members">
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <TextField source="group.name" />
              <DateField source="startDate" />
              <DateField source="endDate" defaultValue={undefined} />
            </Datagrid>
          </ReferenceArrayField>
        </FormTab>
        <FormTab label="Events">
          <ReferenceManyEventField source="id" target="actors[]" />
          <CreateEventButton
            transform={async (t, r) => {
              if (t === http.Events.EventTypes.DEATH.value) {
                return {
                  draft: true,
                  type: t,
                  excerpt: undefined,
                  body: undefined,
                  date: new Date(),
                  payload: {
                    victim: r.id,
                    location: O.none,
                  },
                  media: [],
                  keywords: [],
                  links: [],
                };
              }
              return Promise.reject(new Error(`Can't create event ${t}`));
            }}
          />
        </FormTab>
        <FormTab label="networks">
          <LazyFormTabContent tab={5}>
            <EventsNetworkGraphFormTab type="actors" />
          </LazyFormTabContent>
        </FormTab>
        <FormTab label="flows">
          <LazyFormTabContent tab={6}>
            <EventsFlowGraphFormTab type="actors" />
          </LazyFormTabContent>
        </FormTab>
        <FormTab label="Entitree">
          <div style={{ height: 600, width: "100%" }}>
            <EntitreeGraph />
          </div>
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export default ActorEdit;
