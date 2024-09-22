import { APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import * as React from "react";
import { type FallbackProps } from "react-error-boundary";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "../mui/index.js";

export const ErrorBox = ({ error: e }: FallbackProps): JSX.Element => {
  const error = React.useMemo((): APIError => {
    if (e instanceof APIError) {
      return e;
    }
    if (e instanceof Error) {
      return new APIError(e.message, {
        kind: "ServerError",
        status: "500",
        meta: [e.stack ?? JSON.stringify(e, null, 2)],
      });
    }

    return new APIError("Unknown error", {
      kind: "ClientError",
      status: "400",
      meta: [JSON.stringify(e, null, 2)],
    });
  }, [e]);

  const details = React.useMemo(() => {
    if (
      error.details.kind === "ServerError" ||
      error.details.kind === "ClientError"
    ) {
      return <div>{JSON.stringify(error.details.meta)}</div>;
    }

    if (error.details.kind === "DecodingError") {
      return (
        <div>
          {error.details.errors.map((detail: any, i) => (
            <code key={i}>{detail}</code>
          ))}
        </div>
      );
    }

    return null;
  }, [error]);

  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="flex-end" spacing={1}>
            <Typography variant="h5" marginBottom={0}>
              {error.name}:
            </Typography>
            <Typography variant="subtitle1" marginBottom={0}>
              {error.message}
            </Typography>
          </Stack>
        }
      />
      <CardContent>
        <Accordion>
          <AccordionSummary>Details</AccordionSummary>
          <AccordionDetails>{details}</AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};
