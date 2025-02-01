import { fp } from "@liexp/core/lib/fp/index.js";
import {
  APIError,
  toAPIError,
} from "@liexp/shared/lib/io/http/Error/APIError.js";
import { CoreError } from "@liexp/shared/lib/io/http/Error/CoreError.js";
import { ErrorDecoder } from "@liexp/shared/lib/io/http/Error/ErrorDecoder.js";
import { type Either } from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter.js";
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
    const isAPIError = APIError.is(error) && (error.details?.length ?? 0) > 0;
    if (isAPIError) {
      return (
        <div>
          {error.details?.map((detail: any, i) => (
            <code key={i}>{detail}</code>
          ))}
        </div>
      );
    }

    const isCoreError = CoreError.is(error) && (error.details?.length ?? 0) > 0;
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
}: ErrorBoxProps): React.JSX.Element => {
  const error = React.useMemo((): APIError | CoreError => {
    if (APIError.is(e)) {
      return e;
    }

    return pipe(
      toAPIError(e),
      fp.E.right,
      fp.E.alt(
        (): Either<t.Errors, APIError | CoreError> => ErrorDecoder.decode(e),
      ),
      fp.E.match(
        (e) => {
          return {
            name: "DecodingError",
            message: "Failed to decode error",
            details: PathReporter.report(t.failures(e)),
            status: 500,
          };
        },
        (e) => e,
      ),
    );
  }, [e]);

  return (
    <Card style={style}>
      <CardHeader
        title={
          <Stack direction="column" alignItems="flex-start" spacing={1}>
            <Typography variant="h5" marginBottom={0}>
              {error.name} {APIError.is(error) ? `(${error.status})` : ""}
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
): React.JSX.Element => <ErrorBox enableReset {...props} />;
