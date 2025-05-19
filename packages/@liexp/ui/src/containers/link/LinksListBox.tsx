import * as React from "react";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import { LinksList } from "../../components/lists/LinkList.js";
import { paginationToParams } from "../../utils/params.utils.js";
import { type LinksBoxProps } from "./LinksBox.js";

export const LinksListBox: React.FC<LinksBoxProps> = ({
  filter,
  onItemClick,
  column,
}) => {
  const perPage = filter?.ids?.length ?? 20;

  return (
    <QueriesRenderer
      queries={(Q) => ({
        links: Q.Link.list.useQuery(
          undefined,
          {
            ...filter,
            ...paginationToParams({ page: 1, perPage }),
          },
          true,
        ),
      })}
      render={({ links: { data: links } }) => {
        return (
          <LinksList
            column={column}
            links={links.map((l) => ({ ...l, selected: true }))}
            onItemClick={onItemClick}
          />
        );
      }}
    />
  );
};
