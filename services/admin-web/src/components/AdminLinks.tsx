import * as React from "react";
import {
  AutocompleteArrayInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Filter,
  List,
  ListProps,
  ReferenceArrayInput,
  Resource,
  ResourceProps,
  SelectArrayInput,
  SimpleForm,
  TextField,
  TextInput,
  UrlField,
} from "react-admin";

const RESOURCE = "links";

const LinksFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <ReferenceArrayInput source="events" reference="events" alwaysOn>
        <AutocompleteArrayInput optionText="title" />
      </ReferenceArrayInput>
    </Filter>
  );
};

export const LinkList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE} filters={<LinksFilter />} perPage={20}>
    <Datagrid rowClick="edit">
      <UrlField source="url" />
      <TextField source="description" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

// const EditTitle: React.FC<EditProps> = ({ record }: any) => {
//   return <span>Events {record.title}</span>;
// };

// export const EventEdit: React.FC<EditProps> = (props: EditProps) => (
//   <Edit
//     title={<EditTitle {...props} />}
//     {...props}
//     transform={(r) => {
//       const actors = r.actors.concat(r.newActors ?? []);
//       const groups = r.groups.concat(r.newGroups ?? []);
//       const links = r.links.concat(r.newLinks ?? []);
//       return {
//         ...r,
//         endDate: r.endDate === "" ? undefined : r.endDate,
//         actors,
//         groups,
//         links,
//       };
//     }}
//   >
//     <TabbedForm>
//       <FormTab label="Generals">
//         <DateInput source="startDate" />
//         <DateInput source="endDate" />
//         <TextInput source="title" />
//         <MarkdownInput source="body" />
//         <DateField source="updatedAt" showTime={true} />
//         <DateField source="createdAt" showTime={true} />
//       </FormTab>
//       <FormTab label="Location">
//         <MapInput source="location" type={GeometryType.POINT} />
//       </FormTab>
//       <FormTab label="Actors">
//         <ReferenceArrayInput
//           source="newActors"
//           reference="actors"
//           filterToQuery={(q: string) => ({ fullName: q })}
//         >
//           <AutocompleteArrayInput source="id" optionText="fullName" />
//         </ReferenceArrayInput>
//         <ReferenceArrayField source="actors" reference="actors">
//           <Datagrid rowClick="edit">
//             <TextField source="id" />
//             <TextField source="fullName" />
//             <AvatarField source="avatar" />
//           </Datagrid>
//         </ReferenceArrayField>
//       </FormTab>
//       <FormTab label="Group Members">
//         <ReferenceArrayInput
//           source="newGroupsMembers"
//           reference="groups-members"
//         >
//           <AutocompleteArrayInput
//             source="id"
//             optionText={(m: any) => `${m.group.name} - ${m.actor.fullName}`}
//           />
//         </ReferenceArrayInput>
//         <ReferenceManyField target="groupsMembers" reference="groups-members">
//           <Datagrid rowClick="edit">
//             <ReferenceField source="id" reference="groups-members">
//               <TextField source="id" />
//             </ReferenceField>
//             <TextField source="actor.fullName" />
//             <TextField source="group.name" />
//             <DateField source="startDate" />
//           </Datagrid>
//         </ReferenceManyField>
//       </FormTab>
//       <FormTab label="Groups">
//         <ReferenceArrayInput source="newGroups" reference="groups">
//           <AutocompleteArrayInput source="id" optionText="name" />
//         </ReferenceArrayInput>
//         <ReferenceManyField target="groups" reference="groups">
//           <Datagrid rowClick="edit">
//             <TextField source="id" />
//             <TextField source="name" />
//             <ImageField source="avatar" fullWidth={false} />
//           </Datagrid>
//         </ReferenceManyField>
//       </FormTab>
//       <FormTab label="Images">
//         <ArrayInput source="newImages">
//           <SimpleFormIterator>
//             <ImageInput source="location">
//               <ImageField src="src" />
//             </ImageInput>
//           </SimpleFormIterator>
//         </ArrayInput>

//         <ArrayField source="images">
//           <Datagrid rowClick="edit">
//             <TextField source="id" />
//             <ImageField source="location" fullWidth={false} />
//             <TextField source="description" />
//           </Datagrid>
//         </ArrayField>
//       </FormTab>
//       <FormTab label="Links">
//         <ArrayInput source="newLinks">
//           <SimpleFormIterator>
//             <TextInput type="url" source="url" />
//             <TextInput source="description" />
//           </SimpleFormIterator>
//         </ArrayInput>
//         <ArrayField source="links">
//           <Datagrid resource="links" rowClick="edit">
//             <TextField source="id" />
//             <TextField source="url" />
//             <TextField source="description" />
//           </Datagrid>
//         </ArrayField>
//       </FormTab>
//       <FormTab label="Preview">
//         <FormDataConsumer>
//           {({ formData, ...rest }) => {
//             return pipe(
//               http.Events.Uncategorized.Uncategorized.decode(formData),
//               E.fold(renderValidationErrors, (p) => (
//                 <EventPageContent
//                   event={p}
//                   actors={[]}
//                   groups={[]}
//                   links={[]}
//                 />
//               ))
//             );
//           }}
//         </FormDataConsumer>
//       </FormTab>
//     </TabbedForm>
//   </Edit>
// );

export const LinkCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Link" {...props}>
    <SimpleForm>
      <TextInput type="url" source="url" />
      <TextInput type="text" source="description" />
      <ReferenceArrayInput source="events" reference="events" defaultValue={[]}>
        <SelectArrayInput optionText="title" />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export const AdminLinksResource: React.FC<ResourceProps> = (props) => {
  return (
    <Resource
      {...props}
      name={RESOURCE}
      list={LinkList}
      // edit={DeathEdit}
      create={LinkCreate}
    />
  );
};
