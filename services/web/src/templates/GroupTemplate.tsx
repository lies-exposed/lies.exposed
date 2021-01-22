import { ErrorBox } from "@components/Common/ErrorBox";
import { Loader } from "@components/Common/Loader";
import { GroupPageContent } from "@components/GroupPageContent";
import { MainContent } from "@components/MainContent";
import SEO from "@components/SEO";
import { EventSlider } from "@components/sliders/EventSlider";
import { group } from "@providers/DataProvider";
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
        (projectId) => (
          <WithQueries
            queries={{ group: group }}
            params={{ group: { id: projectId } }}
            render={QR.fold(Loader, ErrorBox, ({ group }) => (
              <MainContent>
                <SEO title={group.name} />
                <GroupPageContent
                  {...group}
                  events={[]}
                  funds={[]}
                  projects={[]}
                  onMemberClick={async (a) => {
                    if (this.props.navigate !== undefined) {
                      await this.props.navigate(`/actors/${a.id}`);
                    }
                  }}
                />
                <EventSlider events={[]} />
              </MainContent>
            ))}
          />
        )
      )
    );
  }
}
