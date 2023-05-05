import { type Actor } from "@liexp/shared/lib/io/http/Actor";
import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { ActorList, type ActorListProps } from "../components/lists/ActorList";
import { useActorsQuery } from "../state/queries/actor.queries";

interface ActorsBoxWrapperProps {
  params: Partial<GetListParams>;
  discrete?: boolean;
  prefix?: string;
  children: (r: { data: Actor[]; total: number }) => JSX.Element;
}

export const ActorsBoxWrapper: React.FC<ActorsBoxWrapperProps> = ({
  params,
  discrete = true,
  prefix = "actors-wrapper",
  children,
}) => {
  return (
    <QueriesRenderer
      queries={{ actors: useActorsQuery(params, discrete, prefix) }}
      render={({ actors }) => children(actors)}
    />
  );
};

type ActorsBoxProps<D extends React.ElementType<any> = "ul"> = Omit<
  ActorListProps<D>,
  "actors" | "onActorClick"
> &
  Omit<ActorsBoxWrapperProps, "children">;

const ActorsBox = <D extends React.ElementType<any> = "ul">({
  params,
  displayFullName,
  style,
  itemStyle,
  onItemClick,
  discrete,
  prefix,
  ...props
}: ActorsBoxProps<D>): JSX.Element => {
  return (
    <ActorsBoxWrapper params={params} discrete={discrete} prefix={prefix}>
      {({ data: actors }) => (
        <ActorList
          {...props}
          displayFullName={displayFullName}
          style={style}
          itemStyle={itemStyle}
          actors={actors.map((a) => ({ ...a, selected: true }))}
          onActorClick={(a) => onItemClick?.(a)}
          onItemClick={onItemClick}
        />
      )}
    </ActorsBoxWrapper>
  );
};

export default ActorsBox;
