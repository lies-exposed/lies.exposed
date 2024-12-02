import * as React from "react";
import {
  Mode,
  createJSONEditor,
  isJSONContent,
  isTextContent,
  type JSONEditorPropsOptional,
  type JsonEditor,
} from "vanilla-jsoneditor";
import {
  Button,
  Labeled,
  type TextInputProps,
  useInput,
} from "../../admin/react-admin";

const JsonEditorReact: React.FC<JSONEditorPropsOptional> = (props) => {
  const refContainer = React.useRef<HTMLDivElement | null>(null);
  const refEditor = React.useRef<JsonEditor | null>(null);

  React.useEffect(() => {
    // create editor
    refEditor.current = createJSONEditor({
      target: refContainer.current!,
      props,
    });

    return () => {
      // destroy editor
      if (refEditor.current) {
        void refEditor.current.destroy().then(() => {
          refEditor.current = null;
        });
      }
    };
  }, []);

  // update props
  React.useEffect(() => {
    // only pass the props that actually changed
    // since the last time to prevent syncing issues
    // const changedProps = filterUnchangedProps(props, refPrevProps.current);
    if (refEditor.current) {
      void refEditor.current.updateProps(props);
    }
  }, [props]);

  if (typeof window === "undefined") {
    return null;
  }

  return <div className="vanilla-jsoneditor-react" ref={refContainer}></div>;
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

  return (
    <Labeled label={label} fullWidth>
      <>
        <JsonEditorReact
          content={value ? { json: value } : undefined}
          mode={Mode.text}
          onChange={(content, prevContent, status) => {
            if (isJSONContent(content)) {
              onChange(content.json);
            } else if (isTextContent(content)) {
              onChange(JSON.parse(content.text));
            }
          }}
        />
        <Button label="Clear" onClick={() => onClear?.()} />
      </>
    </Labeled>
  );
};

export default JSONInput;
