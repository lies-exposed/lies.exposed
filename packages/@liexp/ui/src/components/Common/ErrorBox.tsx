import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import * as React from "react";
import { type FallbackProps } from "react-error-boundary";
import { Box, Card, CardContent, CardHeader, Grid, Typography } from "../mui";

const APIErrorBox = (e: APIError): React.ReactElement => {
  return (
    <Card>
      <CardHeader
        title={"APIError"}
        subheader={<Typography variant="subtitle1">{e.message}</Typography>}
      />
      <CardContent>
        <Box>
          <code>{e.details.join("\n")}</code>
        </Box>
      </CardContent>
    </Card>
  );
};

export const ErrorBox: React.FC<FallbackProps> = ({ error: e }) => {
  const box = React.useMemo(() => {
    if (e.name === "APIError") {
      return <APIErrorBox {...e} />;
    }
    return (
      <Card>
        <CardContent>
          <Typography>An error occurred</Typography>
          <div style={{ width: "100%" }}>{JSON.stringify(e, null, 4)}</div>
        </CardContent>
      </Card>
    );
  }, [e]);

  return <Grid item>{box}</Grid>;
};
