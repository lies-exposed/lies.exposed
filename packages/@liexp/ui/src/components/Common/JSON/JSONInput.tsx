import * as React from "react";
import { Button, Labeled, type TextInputProps, useInput } from "react-admin";

const useJsonEditorReact = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return React.lazy(() =>
    import("jsoneditor-react").then((module) => {
      return {
        default: module.JsonEditor,
      };
    }),
  );
};

export interface JSONInputProps extends TextInputProps {
  label?: string;
  source: string;
  style?: React.CSSProperties;
  onClear?: () => void;
}

const JSONInput: React.FC<JSONInputProps> = ({
  source,
  label = source,
  style,
  onClear,
  ...props
}) => {
  const {
    field: { value, onChange },
  } = useInput({
    ...props,
    format: (v) => (v === "" ? null : v),
    source,
    defaultValue: props.value ?? props.defaultValue ?? null,
  });

  const JsonEditor: any = useJsonEditorReact();

  if (!JsonEditor) {
    return null;
  }

  return (
    <Labeled label={label} fullWidth>
      <>
        <React.Suspense fallback={<div>Loading...</div>}>
          <JsonEditor
            value={value}
            onChange={onChange}
            mode="text"
            theme="ace/theme/github"
          />
        </React.Suspense>

        <Button label="Clear" onClick={() => onClear?.()} />
      </>
    </Labeled>
  );
};

export default JSONInput;
