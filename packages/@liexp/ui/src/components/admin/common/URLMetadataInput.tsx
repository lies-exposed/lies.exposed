import { type SCIENTIFIC_STUDY } from "@liexp/io/lib/http/Events/EventType.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as React from "react";
import { TextInput, type TextInputProps, useInput } from "react-admin";
import { useFormContext } from "react-hook-form";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Box, Button, TextField } from "../../mui/index.js";

const MONTH_ABBR: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

// Matches paths like /2025/jul/26/ or /2025/07/26/
const URL_DATE_RE =
  /\/(\d{4})\/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|0?\d|1[0-2])\/(\d{1,2})\//i;

function extractDateFromUrl(url: string): string | null {
  const m = URL_DATE_RE.exec(url);
  if (!m) return null;
  const [, year, month, day] = m;
  const mm = MONTH_ABBR[month.toLowerCase()] ?? month.padStart(2, "0");
  const dd = day.padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

interface URLMetadataInputProps extends TextInputProps {
  type: SCIENTIFIC_STUDY | "Link";
}

const URLMetadataInput: React.FC<URLMetadataInputProps> = ({
  type,
  ...props
}) => {
  const {
    field: { onChange, value, ...inputRest },

    formState: _formState,

    fieldState: _fieldState,
    ...rest
  } = useInput(props);
  const dataProvider = useDataProvider();
  const { setValue, getValues } = useFormContext();

  React.useEffect(() => {
    if (!value) return;
    const date = extractDateFromUrl(value);
    if (date && !getValues("publishDate")) {
      setValue("publishDate", date, { shouldDirty: true });
    }
  }, []);

  const [metadata, setMetadata] = React.useState<
    | (typeof Endpoints.OpenGraph.Custom.GetMetadata.Output.Type)["data"]
    | undefined
  >(undefined);

  const handleSubmit = React.useCallback(
    (url: string) => {
      void dataProvider
        .get("open-graph/metadata", { url, type })
        .then(
          (
            result: typeof Endpoints.OpenGraph.Custom.GetMetadata.Output.Type,
          ) => {
            setMetadata(result.data);
          },
        );
    },
    [value],
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback((e) => {
      const url = e.currentTarget.value;
      onChange(url);
      const date = extractDateFromUrl(url);
      if (date) {
        setValue("publishDate", date, { shouldDirty: true });
      }
    }, []);

  return (
    <Box width={"100%"} style={{ display: "flex" }} flexDirection="row">
      <Box>
        <TextInput
          {...props}
          {...rest}
          {...inputRest}
          type="url"
          onChange={handleChange}
        />
        <Box>
          {metadata?.link ? <Box>Link found: {metadata.link.id}</Box> : null}
          {metadata?.metadata ? (
            <Box display="inline" marginLeft={2} flexBasis={"60%"}>
              {Object.entries<string>(metadata.metadata).map(([k, v]) => {
                const value = v ?? "";
                return (
                  <Box key={k} width={"100%"}>
                    <label>{k}</label>
                    <TextField
                      name={`metadata.${k}`}
                      type="text"
                      value={value}
                      multiline={value.length > 30}
                      contentEditable={false}
                      fullWidth={true}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : null}
        </Box>
      </Box>
      <Box>
        <Button
          disabled={value?.length < 5}
          onClick={() => {
            window.open(value, "_blank");
          }}
        >
          Open URL
        </Button>
        <Button
          disabled={value?.length < 5}
          onClick={() => {
            handleSubmit(value);
          }}
        >
          Get Metadata
        </Button>
      </Box>
    </Box>
  );
};

export default URLMetadataInput;
