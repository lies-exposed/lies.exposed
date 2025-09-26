import { kebabCase } from "lodash";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Stack } from "../../../mui/index.js";
import { TextInput, type TextInputProps } from "../../react-admin.js";

export interface JSONInputProps extends TextInputProps {
  label?: string;
  source: string;
  slugSource?: string;
  style?: React.CSSProperties;
  onClear?: () => void;
}

export const TextWithSlugInput: React.FC<JSONInputProps> = ({
  source,
  slugSource = "slug",
  label = source,
  style,
  onClear,
  defaultValue = "",
  ...props
}) => {
  const form = useFormContext();
  const { watch, setValue, getValues, formState } = form;
  const watchedValue = watch(source, defaultValue);

  React.useEffect(() => {
    const v = watchedValue ?? "";
    const generated = kebabCase(v);

    const currentSlug = getValues(slugSource) ?? "";
    const isSlugDirty = !!(
      formState?.dirtyFields && (formState.dirtyFields as any)[slugSource]
    );

    // only auto-update slug when the slug field hasn't been manually edited
    if (!isSlugDirty && currentSlug !== generated) {
      setValue(slugSource, generated, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [watchedValue, slugSource, setValue, getValues, formState]);

  return (
    <Stack style={style}>
      <TextInput {...props} source={source} defaultValue={defaultValue} />
      <TextInput {...props} source={slugSource} />
    </Stack>
  );
};
