import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { GroupPageContent } from "@econnessione/shared/components/GroupPageContent";
import { MainContent } from "@econnessione/shared/components/MainContent";
import SEO from "@econnessione/shared/components/SEO";
import { EventSlider } from "@econnessione/shared/components/sliders/EventSlider";
import {
  group,
  groupMembersList,
  eventsList,
} from "@econnessione/shared/providers/DataProvider";
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
    // eslint-disable-next-line
    console.log(this.props);

    return pipe(
      O.fromNullable(this.props.groupId),
      O.fold(
        () => <div>Missing project id</div>,
        (groupId) => (
          <WithQueries
            queries={{
              group: group,
              groupMembers: groupMembersList,
              events: eventsList,
            }}
            params={{
              group: { id: groupId },
              groupMembers: {
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
              ({ group, groupMembers, events }) => (
                <MainContent>
                  <SEO title={group.name} />
                  <GroupPageContent
                    {...group}
                    groupMembers={groupMembers.data}
                    events={events.data}
                    funds={[]}
                    projects={[]}
                    onMemberClick={async (a) => {
                      if (this.props.navigate !== undefined) {
                        await this.props.navigate(`/actors/${a.id}`);
                      }
                    }}
                  />
                  <EventSlider filter={{ group: O.some(group.id) }} />
                </MainContent>
              )
            )}
          />
        )
      )
    );
  }
}
