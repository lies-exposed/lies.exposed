import * as React from "react";
import {
  Mode,
  createJSONEditor,
  type JSONEditorPropsOptional,
  type JsonEditor,
} from "vanilla-jsoneditor";
import {
  Button,
  Labeled,
  type TextInputProps,
  useInput,
} from "../../admin/react-admin";

const useJsonEditorReact = (
  props: JSONEditorPropsOptional,
): React.ReactNode | null => {
  const refContainer = React.useRef<HTMLDivElement | null>(null);
  const refEditor = React.useRef<JsonEditor | null>(null);
  const refPrevProps = React.useRef<JSONEditorPropsOptional>(props);

  React.useEffect(() => {
    return () => {
      // destroy editor
      if (refEditor.current) {
        void refEditor.current.destroy().then(() => {
          refEditor.current = null;
        });
      }
    };
  }, []);

  React.useEffect(() => {
    if (refContainer.current && !refEditor.current) {
      // create editor
      refEditor.current = createJSONEditor({
        target: refContainer.current!,
        props,
      });
    }
  }, [refContainer.current]);

  // update props
  React.useEffect(() => {
    if (refEditor.current) {
      // only pass the props that actually changed
      // since the last time to prevent syncing issues
      const changedProps = filterUnchangedProps(props, refPrevProps.current);
      if (!Object.is(changedProps, {})) {
        void refEditor.current.updateProps(changedProps).then(() => {
          refPrevProps.current = props;
        });
      }
    }
  }, [props]);

  if (typeof window === "undefined") {
    return null;
  }

  return <div className="vanilla-jsoneditor-react" ref={refContainer}></div>;
};

function filterUnchangedProps(
  props: JSONEditorPropsOptional,
  prevProps: JSONEditorPropsOptional,
): JSONEditorPropsOptional {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([key, value]) =>
        value !== prevProps[key as keyof JSONEditorPropsOptional],
    ),
  );
}

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

  const JsonEditor = useJsonEditorReact({
    content: value ? { json: value } : undefined,
    mode: Mode.text,
    onChange,
  });

  if (!JsonEditor) {
    return null;
  }

  return (
    <Labeled label={label} fullWidth>
      <>
        {JsonEditor}
        <Button label="Clear" onClick={() => onClear?.()} />
      </>
    </Labeled>
  );
};

export default JSONInput;
