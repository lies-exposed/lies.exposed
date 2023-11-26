import { EventTypes } from "@liexp/shared/lib/io/http/Events";
import { type SearchEventsQueryInputNoPagination } from "../../../state/queries/SearchEventsQuery";
import { type EventTypeFiltersProps } from "./EventTypeFilters";

// const PREFIX = "events-app-bar-minimized";
// const classes = {
//   root: `${PREFIX}-root`,
//   dateRangeBox: `${PREFIX}-date-range-box`,
// };

// const StyledGrid = styled(Grid)(({ theme }) => ({
//   [`&.${classes.root}`]: {
//     display: "flex",
//     width: "100%",
//     flexDirection: "row",
//     alignItems: "center",
//     flexWrap: "wrap",
//     [theme.breakpoints.down("sm")]: {
//       flexDirection: "column",
//     },
//   },
//   [`& .${classes.dateRangeBox}`]: {
//     display: "flex",
//     alignItems: "center",
//     flexShrink: 0,
//     [theme.breakpoints.down("md")]: {
//       flexDirection: "column",
//     },
//   },
// }));

export const searchEventQueryToEventTypeFilters = (
  query: SearchEventsQueryInputNoPagination,
): Required<EventTypeFiltersProps["filters"]> => {
  return {
    [EventTypes.BOOK.value]: !!query.eventType?.includes(EventTypes.BOOK.value),
    [EventTypes.DEATH.value]: !!query.eventType?.includes(
      EventTypes.DEATH.value,
    ),
    [EventTypes.UNCATEGORIZED.value]: !!query.eventType?.includes(
      EventTypes.UNCATEGORIZED.value,
    ),
    [EventTypes.SCIENTIFIC_STUDY.value]: !!query.eventType?.includes(
      EventTypes.SCIENTIFIC_STUDY.value,
    ),
    [EventTypes.PATENT.value]: !!query.eventType?.includes(
      EventTypes.PATENT.value,
    ),
    [EventTypes.DOCUMENTARY.value]: !!query.eventType?.includes(
      EventTypes.DOCUMENTARY.value,
    ),
    [EventTypes.TRANSACTION.value]: !!query.eventType?.includes(
      EventTypes.TRANSACTION.value,
    ),
    [EventTypes.QUOTE.value]: !!query.eventType?.includes(
      EventTypes.QUOTE.value,
    ),
  };
};

// export interface EventsAppBarMinimizedProps {
//   className?: string;
//   query: SearchEventsQueryInputNoPagination;
//   current?: number;
//   filters: EventTypeFiltersProps["filters"];
//   totals: EventTotals;
//   actors: Actor.Actor[];
//   groups: Group.Group[];
//   keywords: Keyword.Keyword[];
//   groupsMembers: GroupMember.GroupMember[];
//   onQueryChange: (e: SearchEventsQueryInputNoPagination) => void;
//   open: boolean;
//   layout?: Partial<{
//     searchBox: number
//     eventTypes: number;
//     dateRangeBox: { columns: number; variant: "slider" | "picker" };
//     relations: number;
//   }>;
// }

// export const EventsAppBarMinimized: React.FC<EventsAppBarMinimizedProps> = ({
//   className,
//   open: isExpanded,
//   query,
//   filters,
//   actors,
//   groups,
//   keywords,
//   groupsMembers,
//   onQueryChange,
//   totals,
//   layout,
// }) => {
//   const selectedGroups = React.useMemo(
//     () => groups,
//     [groups]
//   );
//   const selectedActors = React.useMemo(
//     () => actors,
//     [actors]
//   );
//   const selectedKeywords = React.useMemo(
//     () => keywords,
//     [keywords]
//   );

//   const handleFilterChange = React.useCallback(
//     (ff: EventTypeMap, filterK: EventType) => {
//       const type = [
//         [ff.Uncategorized, UNCATEGORIZED.value],
//         [ff.Death, DEATH.value],
//         [ff.Documentary, DOCUMENTARY.value],
//         [ff.Patent, PATENT.value],
//         [ff.ScientificStudy, SCIENTIFIC_STUDY.value],
//         [ff.Transaction, TRANSACTION.value],
//         [ff.Quote, QUOTE.value],
//       ]
//         .map(([enabled, key]: any[]) => (enabled ? key : undefined))
//         .filter((a) => a !== undefined);

//       onQueryChange({
//         ...query,
//         type,
//       });
//     },
//     [query]
//   );

//   const handleQueryChange = React.useCallback(
//     (q: any): void => {
//       onQueryChange({
//         ...query,
//         actors: actors.map((a) => a.id),
//         groups: groups.map((a) => a.id),
//         keywords: keywords.map((a) => a.id),
//         ...q,
//       });
//     },
//     [query]
//   );

//   const dateRangeBox =
//     query.startDate ?? query.endDate ? (
//       <Box className={classes.dateRangeBox}>
//         {query.startDate ? (
//           <Typography variant="subtitle1" style={{ marginRight: 10 }}>
//             From <b>{query.startDate}</b>
//           </Typography>
//         ) : null}
//         {query.endDate ? (
//           <Typography variant="subtitle1" style={{ marginRight: 10 }}>
//             To <b>{query.endDate}</b>
//           </Typography>
//         ) : null}
//       </Box>
//     ) : null;

//   const actorsList = (
//     <ActorList
//       style={{
//         display: "flex",
//         flexDirection: "row",
//       }}
//       actors={[]}
//       onActorClick={(k) => {
//         handleQueryChange({
//           actors: actors
//             // .map((g) => ({
//             //   ...g,
//             //   selected: g.id === k.id ? !k.selected : g.selected,
//             // }))
//             // .filter((s) => s.selected)
//             .map((a) => a.id),
//         });
//       }}
//     />
//   );

//   const groupsList = (
//     <GroupList
//       style={{
//         display: "flex",
//         flexDirection: "row",
//       }}
//       groups={[]}
//       onItemClick={(k) => {
//         if (isExpanded) {
//           handleQueryChange({
//             groups: groups
//               // .map((g) => ({
//               //   ...g,
//               //   selected: g.id === k.id ? !k.selected : g.selected,
//               // }))
//               // .filter((s) => s.selected)
//               .map((a) => a.id),
//           });
//         }
//       }}
//     />
//   );

//   const keywordList = (
//     <KeywordList
//       style={{
//         display: "flex",
//         flexDirection: "row",
//       }}
//       keywords={[]}
//       onItemClick={(k) => {
//         if (isExpanded) {
//           handleQueryChange({
//             keywords: keywords
//               // .map((kk) => ({
//               //   ...kk,
//               //   selected: kk.id === k.id ? !k.selected : kk.selected,
//               // }))
//               // .filter((k) => k.selected)
//               .map((k) => k.id),
//           });
//         }
//       }}
//     />
//   );

//   const groupsMembersList = (
//     <GroupsMembersList
//       groupsMembers={groupsMembers.map((g) => ({ ...g, selected: true }))}
//       onItemClick={(gm) => {
//         if (isExpanded) {
//           onQueryChange({
//             ...query,
//             groupsMembers: query.groupsMembers?.filter((g) => gm.id !== g),
//           });
//         }
//       }}
//     />
//   );

//   return (
//     <StyledGrid className={clsx(classes.root, className)} container>
//       <Grid
//         item
//         sm={8}
//         md={layout?.eventTypes}
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           flexWrap: "wrap",
//           width: "100%",
//         }}
//       >
//         <EventTypeFilters
//           filters={filters}
//           totals={totals}
//           onChange={handleFilterChange}
//         />
//       </Grid>

//       {dateRangeBox ? (
//         <Grid
//           item
//           sm={4}
//           md={layout?.dateRangeBox?.columns}
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             flexWrap: "wrap",
//           }}
//         >
//           {dateRangeBox}
//         </Grid>
//       ) : null}

//       {selectedKeywords.length > 0 ? (
//         <Grid
//           item
//           sm={12}
//           md={layout?.relations}
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             flexDirection: "row",
//             flexShrink: 0,
//           }}
//         >
//           {keywordList}
//         </Grid>
//       ) : null}
//       {selectedGroups.length > 0 ? (
//         <Grid
//           item
//           sm={12}
//           md={layout?.relations}
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             flexDirection: "row",
//             flexShrink: 0,
//           }}
//         >
//           {groupsList}
//           {groupsMembersList}
//         </Grid>
//       ) : null}
//       {selectedActors.length > 0 ? (
//         <Grid
//           item
//           sm={12}
//           md={layout?.relations}
//           style={{
//             display: "flex",
//             flexWrap: "wrap",
//             flexDirection: "row",
//             flexShrink: 0,
//           }}
//         >
//           {actorsList}
//         </Grid>
//       ) : null}
//     </StyledGrid>
//   );
// };
