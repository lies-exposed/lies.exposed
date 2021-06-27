import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { ActorPageContent } from "@econnessione/shared/components/ActorPageContent";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { MainContent } from "@econnessione/shared/components/MainContent";
import SEO from "@econnessione/shared/components/SEO";
import { EventSlider } from "@econnessione/shared/components/sliders/EventSlider";
import { eventMetadataMapEmpty } from "@econnessione/shared/mock-data/events/events-metadata";
import { Queries } from "@econnessione/shared/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import { formatDate } from "@utils/date";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

export class DeathBox extends React.PureComponent<{
  id: string;
}> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.id),
      O.fold(
        () => <div>Missing death id</div>,
        (deathId) => (
          <WithQueries
            queries={{ death: Queries.DeathEvent.get }}
            params={{
              death: { id: deathId },
            }}
            render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ death }) => {
              return <div>Died on {formatDate(death.date)}</div>;
            })}
          />
        )
      )
    );
  }
}
