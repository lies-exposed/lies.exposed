import { fp } from "@liexp/core/lib/fp/index.js";
import {
  APIError,
  toAPIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { CoreError } from "@liexp/shared/lib/io/http/Error/CoreError.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { ErrorDecoder } from "@liexp/shared/lib/io/http/Error/ErrorDecoder.js";
import { Schema } from "effect";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { type FallbackProps } from "react-error-boundary";
import {
  Accordion,
  AccordionDetails,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "../mui/index.js";

const ErrorBoxDetails: React.FC<{ error: APIError | CoreError }> = ({
  error,
}) => {
  const details = React.useMemo(() => {
    const isAPIError =
      Schema.is(APIError)(error) && (error.details?.length ?? 0) > 0;
    if (isAPIError) {
      return (
        <div>
          {error.details?.map((detail: any, i) => (
            <code key={i}>{detail}</code>
          ))}
        </div>
      );
    }

    const isCoreError =
      Schema.is(CoreError)(error) && (error.details?.length ?? 0) > 0;
    if (isCoreError) {
      return (
        <div>
          {error.details?.map((detail, i) => (
            <Typography key={i} fontSize={"small"} display={"block"}>
              {detail}
            </Typography>
          ))}
        </div>
      );
    }

    return null;
  }, [error]);

  return (
    details && (
      <Accordion>
        <AccordionDetails>{details}</AccordionDetails>
      </Accordion>
    )
  );
};

interface ErrorBoxProps extends FallbackProps {
  enableReset?: boolean;
  style?: React.CSSProperties;
}

export const ErrorBox = ({
  error: e,
  resetErrorBoundary,
  enableReset = false,
  style,
}: ErrorBoxProps): React.ReactElement => {
  const error = React.useMemo((): APIError | CoreError => {
    if (Schema.is(APIError)(e)) {
      return e;
    }

    return pipe(
      toAPIError(e),
      fp.E.right,
      fp.E.alt(() => ErrorDecoder.decode(e)),
      fp.E.match(
        (e): CoreError => {
          return toAPIError(DecodeError.of("Failed to decode error", e));
        },
        (e): CoreError => e,
      ),
    );
  }, [e]);

  return (
    <Card style={style}>
      <CardHeader
        title={
          <Stack direction="column" alignItems="flex-start" spacing={1}>
            <Typography variant="h5" marginBottom={0}>
              {error.name}{" "}
              {Schema.is(APIError)(error) ? `(${error.status})` : ""}
            </Typography>
            <Typography variant="subtitle1" marginBottom={0}>
              {error.message}
            </Typography>
          </Stack>
        }
      />
      <CardContent>
        <ErrorBoxDetails error={error} />
      </CardContent>
      {enableReset && (
        <CardActions>
          <Button
            onClick={() => resetErrorBoundary()}
            variant="contained"
            size="small"
          >
            Reset error
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export const ResettableErrorBox = (
  props: Omit<ErrorBoxProps, "enableReset">,
): React.ReactElement => <ErrorBox enableReset {...props} />;
