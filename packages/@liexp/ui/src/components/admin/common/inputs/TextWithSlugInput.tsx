import { kebabCase } from "lodash";
import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Stack } from "../../../mui/index.js";
import { TextInput, type TextInputProps } from "../../react-admin.js";

export interface JSONInputProps extends TextInputProps {
  label?: string;
  source: string;
  slugSource?: string;
  style?: React.CSSProperties;
  onClear?: () => void;
}

/**
 * TextWithSlugInput component that automatically generates a kebab-case slug
 * from the source field value.
 *
 * This component renders two TextInput fields. The slug field automatically
 * updates based on the source field, but stops updating if the user manually
 * edits the slug field.
 *
 * Uses react-hook-form's useWatch to observe source field changes and
 * getFieldState to check if slug has been manually edited.
 *
 * @example
 * <SimpleForm>
 *   <TextWithSlugInput source="name" slugSource="username" />
 * </SimpleForm>
 */
export const TextWithSlugInput: React.FC<JSONInputProps> = ({
  source,
  slugSource = "slug",
  label = source,
  style,
  onClear: _onClear,
  defaultValue = "",
  ...props
}) => {
  const formContext = useFormContext();

  const { control, setValue, getValues, getFieldState } = formContext;

  // Watch the source field value using the form's control
  // Do not override the form's default value here — let useWatch return
  // the form-provided default so existing record values are respected.
  const watchedValue = useWatch({ control, name: source });

  // Track whether the user has manually touched the slug field
  const hasManuallyEditedRef = React.useRef(false);
  // Track if we've done the initial setup
  const isInitializedRef = React.useRef(false);

  React.useEffect(() => {
    const sourceValue = watchedValue ?? "";
    const generated = kebabCase(sourceValue);
    const currentSlug = getValues(slugSource) ?? "";

    // Check if slug field has been manually touched by the user
    const slugFieldState = getFieldState(slugSource);
    const isSlugTouched = slugFieldState.isTouched;

    // Mark as manually edited if the user has touched the slug field
    if (isSlugTouched) {
      hasManuallyEditedRef.current = true;
    }

    // On first render, if both source and slug have values, mark as initialized
    // This prevents overwriting existing slugs on record load
    if (!isInitializedRef.current) {
      if (sourceValue !== "" && currentSlug !== "") {
        hasManuallyEditedRef.current = true;
      }
      isInitializedRef.current = true;
    }

    // Only auto-update slug when:
    // 1. The user hasn't manually touched the slug field yet
    // 2. AND the slug doesn't already match the generated value
    if (!hasManuallyEditedRef.current && currentSlug !== generated) {
      setValue(slugSource, generated, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
    }
  }, [watchedValue, slugSource, setValue, getValues, getFieldState]);

  // No DOM fallback: component must be used within a react-hook-form
  // context (e.g. inside react-admin's SimpleForm). Tests and stories should
  // provide the proper form context as well.

  return (
    <Stack style={style}>
      <TextInput
        {...props}
        label={label}
        source={source}
        defaultValue={defaultValue}
      />
      <TextInput {...props} source={slugSource} />
    </Stack>
  );
};
