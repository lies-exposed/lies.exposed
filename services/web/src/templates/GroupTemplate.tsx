import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { EventsMap } from "@econnessione/ui/components/EventsMap";
import { GroupPageContent } from "@econnessione/ui/components/GroupPageContent";
import { MainContent } from "@econnessione/ui/components/MainContent";
import SEO from "@econnessione/ui/components/SEO";
import { EventSlider } from "@econnessione/ui/components/sliders/EventSlider";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

export default class GroupTemplate extends React.PureComponent<
  RouteComponentProps<{ groupId: string }>
> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.groupId),
      O.fold(
        () => <div>Missing project id</div>,
        (groupId) => (
          <WithQueries
            queries={{
              group: Queries.Group.get,
              groupsMembers: Queries.GroupMember.getList,
              events: Queries.Event.getList,
            }}
            params={{
              group: { id: groupId },
              groupsMembers: {
                pagination: {
                  page: 1,
                  perPage: 20,
                },
                sort: { field: "id", order: "DESC" },
                filter: {
                  group: groupId,
                },
              },
              events: {
                pagination: {
                  page: 1,
                  perPage: 20,
                },
                sort: { field: "id", order: "DESC" },
                filter: {
                  group: groupId,
                },
              },
            }}
            render={QR.fold(
              Loader,
              ErrorBox,
              ({ group, groupsMembers, events }) => {
                return (
                  <MainContent>
                    <SEO title={group.name} />
                    <GroupPageContent
                      {...group}
                      groupsMembers={groupsMembers.data}
                      events={events.data}
                      funds={[]}
                      projects={[]}
                      onMemberClick={async (a) => {
                        if (this.props.navigate !== undefined) {
                          await this.props.navigate(`/actors/${a.id}`);
                        }
                      }}
                    />
                    <EventsMap
                      filter={{ groups: O.some([group.id]) }}
                      zoom={4}
                    />
                    <EventSlider filter={{ groups: O.some([group.id]) }} />
                  </MainContent>
                );
              }
            )}
          />
        )
      )
    );
  }
}
