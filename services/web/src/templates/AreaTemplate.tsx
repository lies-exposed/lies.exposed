
import { AreaPageContent } from "@components/AreaPageContent";
import { ErrorBox } from "@components/Common/ErrorBox";
import { Loader } from "@components/Common/Loader";
import { MainContent } from "@components/MainContent";
import SEO from "@components/SEO";
import { area } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

export default class AreaTemplate extends React.PureComponent<
  RouteComponentProps<{
    areaId: string;
  }>
> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.areaId),
      O.fold(
        () => <div>Missing project id</div>,
        (areaId) => (
          <WithQueries
            queries={{ area: area }}
            params={{ area: { id: areaId } }}
            render={QR.fold(Loader, ErrorBox, ({ area }) => {
              return (
                <MainContent>
                  <SEO title={area.label} />
                  <AreaPageContent
                    {...area}
                    onGroupClick={() => {}}
                    onTopicClick={() => {}}
                  />
                  {/* <EventList events={events} actors={[]} groups={[]} /> */}
                </MainContent>
              );
            })}
          />
        )
      )
    );
  }
}
