{{/*
Usage: {{ tuple . "$name" | include "storybook.labels" | indent 2 }}
*/}}

{{- define "storybook.labels" -}}
{{- $scope := index . 0 -}}
{{- $lies_exposed_name := index . 1 -}}
{{- tuple $scope $lies_exposed_name "frontend" | include "common.labels" -}}
{{- end -}}