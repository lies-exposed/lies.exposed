import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer";
import { useEventQuery } from "../state/queries/event.queries";

export class DeathBox extends React.PureComponent<{
  id: string;
}> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.id),
      O.fold(
        () => <div>Missing death id</div>,
        (deathId) => (
          <QueriesRenderer
            queries={{ death: useEventQuery({ id: deathId }) }}
            render={({ death }) => {
              return <div>Died on {formatDate(death.date)}</div>;
            }}
          />
        ),
      ),
    );
  }
}
