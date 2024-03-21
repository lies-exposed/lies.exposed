import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
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

export const ErrorBox: React.FC<FallbackProps> = ({ error: e }) => {
  const error = React.useMemo((): APIError => {
    if (e.name === "APIError" && Array.isArray(e.details)) {
      return e;
    }
    if (e instanceof Error) {
      return {
        name: "APIError",
        message: e.message,
        details: [e.stack ?? JSON.stringify(e, null, 2)],
      };
    }

    return {
      name: "APIError",
      message: "Unknown error",
      details: [JSON.stringify(e, null, 2)],
    };
  }, [e]);

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
          <AccordionDetails>
            {error.details.map((detail, i) => (
              <code key={i}>{detail}</code>
            ))}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};
