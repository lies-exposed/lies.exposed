import type * as io from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useConfiguration } from "../../context/ConfigurationContext.js";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { styled } from "../../theme/index.js";
import { getTextContentsCapped } from "../Common/BlockNote/utils/getTextContentsCapped.js";
import { List, type ListItemProps } from "../Common/List.js";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  type ListProps,
} from "../mui/index.js";

export interface Area extends io.Area.Area {
  selected: boolean;
}

const classes = {
  root: "root",
  media: "media",
};

const StyledBox = styled(Box)({
  [`& .${classes.root}`]: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 20,
  },
  [`& .${classes.media}`]: {
    height: 200,
  },
});

export const AreaListItem: React.FC<
  ListItemProps<Area> & {
    defaultImage: string;
    style?: React.CSSProperties;
  }
> = ({ item, onClick, defaultImage, style }) => {
  const { Queries } = useEndpointQueries();
  const media = Queries.Media.list.useQuery(
    {
      filter: { ids: item.media },
      pagination: { perPage: 1, page: 1 },
      sort: {
        field: "createdAt",
        order: "DESC",
      },
    },
    undefined,
    true,
  );

  const mediaSrc = React.useMemo(() => {
    if (item.featuredImage) {
      return item.featuredImage.location;
    }

    // if (media.data?.data?.[0]?.location) {
    //   return media.data?.data?.[0]?.location;
    // }
    return defaultImage;
  }, [media.data?.data?.[0]?.location]);

  return (
    <StyledBox
      key={item.id}
      display="flex"
      alignItems="center"
      margin={0}
      style={{ cursor: "pointer", flexDirection: "column", ...style }}
      onClick={(e) => onClick?.(item, e)}
    >
      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={mediaSrc}
            title={item.label}
          />
          <CardContent>
            <Typography gutterBottom variant="h6" component="h3">
              {item.label}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {typeof item.body === "string"
                ? item.body
                : getTextContentsCapped(item.body ?? undefined, 100)}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </StyledBox>
  );
};

export interface AreaListProps extends ListProps {
  className?: string;
  areas: Area[];
  onAreaClick: (actor: Area) => void;
  style?: React.CSSProperties;
}

export const AreaList: React.FC<AreaListProps> = ({
  className,
  areas,
  onAreaClick,
  ...props
}) => {
  const conf = useConfiguration();
  return (
    <List
      {...props}
      className={className}
      data={areas}
      getKey={(a) => a.id}
      filter={(a) => true}
      onItemClick={onAreaClick}
      ListItem={(area) => (
        <AreaListItem
          {...area}
          defaultImage={conf.platforms.web.defaultImage}
        />
      )}
    />
  );
};
