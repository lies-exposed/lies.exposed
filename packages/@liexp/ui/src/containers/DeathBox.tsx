import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer.js";

export class DeathBox extends React.PureComponent<{
  id: string;
}> {
  render(): React.ReactElement {
    return pipe(
      O.fromNullable(this.props.id),
      O.fold(
        () => <div>Missing death id</div>,
        (deathId) => (
          <QueriesRenderer
            queries={(Q) => ({ death: Q.Event.get.useQuery({ id: deathId }) })}
            render={({ death: { data: death } }) => {
              return <div>Died on {formatDate(death.date)}</div>;
            }}
          />
        ),
      ),
    );
  }
}
