import * as io from "@liexp/shared/io/http";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography
} from "@mui/material";
import { styled } from "@mui/styles";
import * as React from "react";
import { useMediaQuery } from "../../state/queries/DiscreteQueries";
import { getTextContentsCapped } from "../Common/Editor";
import { List, ListItemProps } from "../Common/List";

export interface Area extends io.Area.Area {
  selected: boolean;
}

const classes = {
  root: "root",
  media: "media",
};

const StyledBox = styled(Box)({
  [`& .${classes.root}`]: {
    maxWidth: 300,
  },
  [`& .${classes.media}`]: {
    height: 200,
  },
});

export const AreaListItem: React.FC<
  ListItemProps<Area> & {
    style?: React.CSSProperties;
  }
> = ({ item, onClick, style }) => {
  const media = useMediaQuery({
    filter: item.media.length > 0 ? { ids: item.media } : {},
    pagination: { perPage: 1, page: 1 },
    sort: {
      field: "createdAt",
      order: "DESC",
    },
  });


  return (
    <StyledBox
      key={item.id}
      display="flex"
      alignItems="center"
      margin={0}
      style={{ cursor: "pointer", flexDirection: "column", ...style }}
      onClick={() => onClick?.(item)}
    >
      <Card className={classes.root}>
        <CardActionArea>
          {(media.data?.data?.length || 0) > 0 ? (
            <CardMedia
              className={classes.media}
              image={(media.data as any).data[0].location}
              title={item.label}
            />
          ) : null}
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {item.label}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {typeof item.body === "string"
                ? item.body
                : getTextContentsCapped((item.body as any) ?? undefined, 100)}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="primary">
            Learn More
          </Button>
        </CardActions>
      </Card>
    </StyledBox>
  );
};

interface AreaListProps {
  className?: string;
  areas: Area[];
  onAreaClick: (actor: Area) => void;
  style?: React.CSSProperties;
}

export const AreaList: React.FC<AreaListProps> = ({
  className,
  areas,
  onAreaClick,
  style,
}) => {
  return (
    <List
      className={className}
      style={style}
      data={areas}
      getKey={(a) => a.id}
      filter={(a) => true}
      onItemClick={onAreaClick}
      ListItem={(area) => <AreaListItem {...area} />}
    />
  );
};
